import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { profiles } from "@shared/models/profiles";
import { eq, like } from "drizzle-orm";
import { setupAuth, isAuthenticated } from "../replit_integrations/auth/replitAuth";
import { registerRoutes } from "../routes";

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

// Injects a mock session with userId into requests
function injectSession(userId: string) {
  return (req: any, _res: any, next: any) => {
    (req.session as any).userId = userId;
    next();
  };
}

// Creates a test app with a specific user injected
async function createTestAppWithUser(userId: string) {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  setupAuth(app);
  app.use(injectSession(userId));
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  return app;
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

async function cleanupTestData() {
  await db.delete(profiles).where(like(profiles.userId, `${TEST_PREFIX}%`));
  await db.delete(users).where(like(users.id, `${TEST_PREFIX}%`));
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Profile endpoints", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    // Pool released automatically on process exit
  });

  // ── N2: PATCH /api/profile returns merged shape with names ─────────────────
  it("PATCH /api/profile returns merged profile+users shape with firstName/lastName", async () => {
    const user = await createTestUser({
      firstName: "Alice",
      lastName: "Smith",
      email: `${testId()}@example.com`,
    });
    await createTestProfile(user.id, { bio: "Original bio", title: "Dev" });

    const app = await createTestAppWithUser(user.id);
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
    expect(res.body.portfolioProjects[0].link).toBe("https://example.com/a");
  });

  // ── N3: POST /api/profile/go-live publishes profile and returns success ──
  it("POST /api/profile/go-live publishes profile and returns merged shape", async () => {
    const user = await createTestUser({
      firstName: "Bob",
      lastName: "Jones",
      email: `${testId()}@example.com`,
    });
    // No profile yet — go-live should create one

    const app = await createTestAppWithUser(user.id);
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

    const app = await createTestAppWithUser(user.id);
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
    // (no 5-minute cache staleness)
    const res2 = await request(app).get("/api/profile");
    // Note: GET /api/profile uses isAuthenticated which loads from cache
    // The PATCH endpoint clears cache, so this should see the new name
    expect(res2.status).toBe(200);
    expect(res2.body.firstName).toBe("New");
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
    // Directly overwrite the DB query builder so the shared db module (used by
    // replitAuth.ts loadProfile) throws. This is more reliable than spyOn
    // because the db object is shared across the same module instance.
    const dbModule = await import("../db");
    const realDb = dbModule.db;
    const originalSelect = (realDb as any).select;
    (realDb as any).select = vi.fn().mockImplementation(() => {
      throw new Error("DB pool exhausted — temporary");
    });

    const brokenApp = express();
    brokenApp.use(express.json());
    brokenApp.use((req: any, _res: any, next: any) => {
      (req.session as any).userId = "some-user-id";
      next();
    });
    setupAuth(brokenApp);
    // Mount only the middleware under test — no full route registry
    brokenApp.use(isAuthenticated);
    brokenApp.get("/api/test-auth", (_req, res) => res.json({ ok: true }));
    const httpServer = createServer(brokenApp);

    const res = await request(brokenApp).get("/api/test-auth");
    // The loadProfile code path should return 503 with SERVICE_UNAVAILABLE
    // when DB is unreachable, not 401 (which would log everyone out).
    expect(res.status).toBe(503);
    expect(res.body.code).toBe("SERVICE_UNAVAILABLE");

    (realDb as any).select = originalSelect;
  });
});
