import { describe, it, expect, beforeEach, afterAll } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { profiles } from "@shared/models/profiles";
import { eq, like } from "drizzle-orm";
import { registerRoutes } from "../routes";
import { setupAuth, isAuthenticated } from "../replit_integrations/auth/replitAuth";

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

  // ── N5: Profile cache is cleared after update ─────────────────────────────
  it("PATCH /api/profile clears cached session data so stale names are not served", async () => {
    const user = await createTestUser({
      firstName: "Old",
      lastName: "Name",
      email: `${testId()}@example.com`,
    });
    await createTestProfile(user.id, { bio: "Initial bio" });

    const { app } = await makeTestApp(user.id);

    // First request: update names
    const res1 = await request(app)
      .patch("/api/profile")
      .send({
        firstName: "New",
        lastName: "Name",
        bio: "Updated bio",
      });
    expect(res1.status).toBe(200);
    expect(res1.body.firstName).toBe("New");

    // Second request: GET profile should see the new names immediately
    const res2 = await request(app).get("/api/profile");
    expect(res2.status).toBe(200);
    expect(res2.body.firstName).toBe("New");
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
