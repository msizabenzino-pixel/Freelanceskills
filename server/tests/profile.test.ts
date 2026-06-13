import { describe, it, expect, beforeEach, afterAll } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { profiles } from "@shared/models/profiles";
import { eq, like } from "drizzle-orm";
import { registerRoutes } from "../routes";
import { setupAuth, isAuthenticated, getUser } from "../replit_integrations/auth/replitAuth";

// ── Test helpers ─────────────────────────────────────────────────────────────

const TEST_PREFIX = "test-profile";

function testId() {
  return `${TEST_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function createTestUser(overrides?: Partial<typeof users.$inferInsert>) {
  const [user] = await db
    .insert(users)
    .values({
      id: testId(),
      email: `${testId()}@example.com`,
      firstName: "Test",
      lastName: "User",
      ...overrides,
    })
    .returning();
  return user;
}

async function createTestProfile(userId: string, overrides?: Partial<typeof profiles.$inferInsert>) {
  const [profile] = await db
    .insert(profiles)
    .values({
      userId,
      userType: "freelancer",
      role: "freelancer",
      ...overrides,
    })
    .returning();
  return profile;
}

// Injects a mock session with userId into requests.
// Must be registered BEFORE registerRoutes so the real route handlers see it.
function injectSession(userId: string) {
  return (req: any, _res: any, next: any) => {
    (req.session as any).userId = userId;
    next();
  };
}

// Build a real app with the production routes registered.
async function makeTestApp(userId: string) {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  setupAuth(app);
  app.use(injectSession(userId));
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  return { app, httpServer };
}

// Like makeTestApp but adds a /api/whoami route that returns req.__user directly.
// This lets tests read the CACHED profile data (what isAuthenticated loaded from
// profileCache) rather than a fresh DB query — essential for cache-invalidation tests.
async function makeTestAppWithWhoami(userId: string) {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  setupAuth(app);
  app.use(injectSession(userId));

  // Register the whoami endpoint BEFORE registerRoutes so it doesn't clash.
  // It deliberately returns req.__user (the isAuthenticated cache result) not a DB fetch.
  app.get("/api/whoami", isAuthenticated, (req, res) => {
    const user = getUser(req);
    res.json(user ?? null);
  });

  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  return { app, httpServer };
}

// ── Cleanup ─────────────────────────────────────────────────────────────────

async function cleanupTestData() {
  await db.delete(profiles).where(like(profiles.userId, `${TEST_PREFIX}%`));
  await db.delete(users).where(like(users.id, `${TEST_PREFIX}%`));
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("Profile endpoints", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // ── N1: GET /api/profile returns merged shape with names ──────────────────
  it("GET /api/profile returns merged profile+users shape with firstName/lastName", async () => {
    const user = await createTestUser({
      firstName: "Alice",
      lastName: "Smith",
      email: `${testId()}@example.com`,
    });
    await createTestProfile(user.id, { bio: "Bio", title: "Dev" });

    const { app } = await makeTestApp(user.id);
    const res = await request(app).get("/api/profile");

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Alice");
    expect(res.body.lastName).toBe("Smith");
    expect(res.body.fullName).toBe("Alice Smith");
    expect(res.body.bio).toBe("Bio");
  });

  // ── N2: PATCH /api/profile returns merged shape with names ───────────────
  it("PATCH /api/profile returns merged profile+users shape with firstName/lastName", async () => {
    const user = await createTestUser({
      firstName: "Alice",
      lastName: "Smith",
      email: `${testId()}@example.com`,
    });
    await createTestProfile(user.id, { bio: "Original bio", title: "Dev" });

    const { app } = await makeTestApp(user.id);
    const res = await request(app)
      .patch("/api/profile")
      .send({
        firstName: "Alice",
        lastName: "Smith",
        bio: "Updated bio",
        title: "Senior Dev",
        skills: ["React", "TypeScript"],
        hourlyRate: 50000,
        location: "Cape Town",
        portfolioProjects: [
          { title: "Project A", link: "https://example.com/a", description: "Desc" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Alice");
    expect(res.body.lastName).toBe("Smith");
    expect(res.body.bio).toBe("Updated bio");
    expect(res.body.title).toBe("Senior Dev");
    expect(res.body.skills).toEqual(["React", "TypeScript"]);
    expect(res.body.hourlyRate).toBe(50000);
    expect(res.body.location).toBe("Cape Town");
    expect(Array.isArray(res.body.portfolioProjects)).toBe(true);
    expect(res.body.portfolioProjects[0].title).toBe("Project A");
  });

  // ── N3: POST /api/profile/go-live publishes profile and returns success ──
  it("POST /api/profile/go-live publishes profile and returns merged shape", async () => {
    const user = await createTestUser({
      firstName: "Bob",
      lastName: "Jones",
      email: `${testId()}@example.com`,
    });
    // No profile yet — go-live should create one

    const { app } = await makeTestApp(user.id);
    const res = await request(app)
      .post("/api/profile/go-live")
      .send({
        firstName: "Bob",
        lastName: "Jones",
        bio: "Full-stack developer",
        title: "Engineer",
        skills: ["Node", "React"],
        hourlyRate: 75000,
        location: "Johannesburg",
        category: "Development",
        experienceLevel: "Senior",
        portfolioProjects: [
          { title: "SaaS Platform", link: "https://saas.dev", description: "Built it" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.publishedProfile).toBe(true);
    expect(res.body.profile.firstName).toBe("Bob");
    expect(res.body.profile.lastName).toBe("Jones");
    expect(res.body.profile.bio).toBe("Full-stack developer");
    expect(res.body.profile.title).toBe("Engineer");
    expect(res.body.profile.skills).toEqual(["Node", "React"]);
    expect(res.body.profile.hourlyRate).toBe(75000);

    // Verify DB state
    const [savedProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id));
    expect(savedProfile.publishedProfile).toBe(true);
    expect(savedProfile.publishedAt).toBeTruthy();
  });

  // ── N5: profileCache is cleared by PATCH (real cache-invalidation test) ────
  //
  // Strategy:
  //   1. Prime the in-memory profileCache by calling /api/whoami (isAuthenticated
  //      loads from DB and stores the SessionUser in profileCache).
  //   2. Directly UPDATE the users table to a different name — WITHOUT going
  //      through the route, so clearProfileCache is NOT called and the cache
  //      remains warm with the old name.
  //   3. NEGATIVE CONTROL: /api/whoami still returns the OLD cached name, proving
  //      the cache is live. (If the cache TTL had expired or didn't exist, this
  //      step would return the new DB value and the test design would be invalid.)
  //   4. Call PATCH /api/profile (which calls clearProfileCache internally).
  //   5. /api/whoami now returns the PATCHED name because the cache was busted
  //      and isAuthenticated had to reload from DB.
  //
  // This test FAILS if clearProfileCache is removed from the PATCH handler,
  // because step 5 would still return the old cached name from step 1–3.
  it("PATCH /api/profile clears profileCache so next isAuthenticated call loads fresh names from DB", async () => {
    const user = await createTestUser({
      firstName: "CacheOld",
      lastName: "CacheLast",
      email: `${testId()}@example.com`,
    });
    await createTestProfile(user.id, { bio: "Initial bio" });

    const { app } = await makeTestAppWithWhoami(user.id);

    // ── Step 1: Prime the profileCache ──────────────────────────────────────
    const prime = await request(app).get("/api/whoami");
    expect(prime.status).toBe(200);
    expect(prime.body.firstName).toBe("CacheOld"); // Cache is now warm

    // ── Step 2: Directly update the users table (no route, no clearProfileCache)
    await db
      .update(users)
      .set({ firstName: "DirectDbName" })
      .where(eq(users.id, user.id));

    // ── Step 3: NEGATIVE CONTROL — cache is still warm; old name served ──────
    const stale = await request(app).get("/api/whoami");
    expect(stale.status).toBe(200);
    // If this assertion fails it means the cache already expired or never existed —
    // the test setup itself would be invalid. A 5-min TTL is far above test duration.
    expect(stale.body.firstName).toBe("CacheOld"); // still stale ← proves cache is live

    // ── Step 4: PATCH via the route (calls clearProfileCache internally) ─────
    const patch = await request(app)
      .patch("/api/profile")
      .send({
        firstName: "CacheNew",
        lastName: "CacheLast",
        bio: "Patched bio",
      });
    expect(patch.status).toBe(200);
    expect(patch.body.firstName).toBe("CacheNew"); // PATCH response is DB-fresh

    // ── Step 5: isAuthenticated now reloads from DB (cache was busted) ───────
    const fresh = await request(app).get("/api/whoami");
    expect(fresh.status).toBe(200);
    // Without clearProfileCache in the PATCH handler, this would still return
    // "CacheOld" (the cached value). With it, the DB value "CacheNew" is served.
    expect(fresh.body.firstName).toBe("CacheNew"); // ← proves clearProfileCache fired
  });

  // ── N6: URL HTML-entity decoding on read ─────────────────────────────────────
  it("GET /api/profile returns clean URLs with HTML entities decoded", async () => {
    const user = await createTestUser({
      firstName: "Url",
      lastName: "Test",
      email: `${testId()}@example.com`,
    });
    await createTestProfile(user.id, {
      bio: "Dev",
      portfolioUrl: "https:&#x2F;&#x2F;test.com",
      linkedinUrl: "https:&#x2F;&#x2F;linkedin.com&#x2F;in&#x2F;test",
      githubUrl: "https:&#x2F;&#x2F;github.com&#x2F;test",
    });

    const { app } = await makeTestApp(user.id);
    const res = await request(app).get("/api/profile");

    expect(res.status).toBe(200);
    expect(res.body.portfolioUrl).toBe("https://test.com");
    expect(res.body.linkedinUrl).toBe("https://linkedin.com/in/test");
    expect(res.body.githubUrl).toBe("https://github.com/test");
  });

  // ── N7: PATCH sanitizes input URLs (writes decoded values) ──────────────────
  it("PATCH /api/profile sanitizes input URLs and writes decoded values to DB", async () => {
    const user = await createTestUser({
      firstName: "Url",
      lastName: "Writer",
      email: `${testId()}@example.com`,
    });
    await createTestProfile(user.id, { bio: "Dev" });

    const { app } = await makeTestApp(user.id);
    const res = await request(app)
      .patch("/api/profile")
      .send({
        portfolioUrl: "https://new.com",
        linkedinUrl: "https://linkedin.com/in/new",
      });

    expect(res.status).toBe(200);
    // The response merges the DB profile with sanitized URLs
    expect(res.body.portfolioUrl).toBe("https://new.com");
    expect(res.body.linkedinUrl).toBe("https://linkedin.com/in/new");

    // Verify DB state — URLs stored cleanly
    const [savedProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id));
    expect(savedProfile.portfolioUrl).toBe("https://new.com");
    expect(savedProfile.linkedinUrl).toBe("https://linkedin.com/in/new");
  });

  // ── N8: Public /api/profile/:id returns decoded URLs ─────────────────────
  it("GET /api/profile/:id returns decoded URLs for public profile", async () => {
    const user = await createTestUser({
      firstName: "Public",
      lastName: "User",
      email: `${testId()}@example.com`,
    });
    await createTestProfile(user.id, {
      bio: "Public bio",
      portfolioUrl: "https:&#x2F;&#x2F;public.com",
      publishedProfile: true,
    });

    // No session needed for public profile
    const app = express();
    app.use(express.json({ limit: "2mb" }));
    const httpServer = createServer(app);
    await registerRoutes(httpServer, app);

    const res = await request(app).get(`/api/profile/${user.id}`);
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("Public bio");
    expect(res.body.portfolioUrl).toBe("https://public.com");
    expect(res.body.firstName).toBe("Public");
    expect(res.body.lastName).toBe("User");
  });
});

describe("Auth middleware", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // ── N9: DB error in loadProfile returns 503, not 401 ──────────────────────
  it("isAuthenticated returns 503 (service unavailable) when DB is unreachable, not 401", async () => {
    // Temporarily overwrite the DB select so loadProfile returns "__DB_ERROR__"
    const dbModule = await import("../db");
    const realDb = dbModule.db;
    const originalSelect = (realDb as any).select;
    (realDb as any).select = () => {
      throw new Error("DB pool exhausted — temporary");
    };

    const app = express();
    app.use(express.json());
    setupAuth(app);
    app.use((req: any, _res: any, next: any) => {
      (req.session as any).userId = "some-user-id";
      next();
    });
    app.use(isAuthenticated);
    app.get("/api/test-auth", (_req, res) => res.json({ ok: true }));

    const res = await request(app).get("/api/test-auth");
    // The loadProfile code path should return 503 with SERVICE_UNAVAILABLE
    // when DB is unreachable, not 401 (which would log everyone out).
    expect(res.status).toBe(503);
    expect(res.body.code).toBe("SERVICE_UNAVAILABLE");

    (realDb as any).select = originalSelect;
  });
});
