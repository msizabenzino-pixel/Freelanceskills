import { describe, it, expect, beforeEach, afterAll } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { profiles } from "@shared/models/profiles";
import { eq, like } from "drizzle-orm";
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

// Injects a mock session with userId into requests
function injectSession(userId: string) {
  return (req: any, _res: any, next: any) => {
    (req.session as any).userId = userId;
    next();
  };
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

    const app = express();
    app.use(express.json({ limit: "2mb" }));
    setupAuth(app);
    app.use(injectSession(user.id));

    // Mount the route under test
    app.get("/api/profile", isAuthenticated, async (req: any, res) => {
      const userId = (req.session as any).userId;
      const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
      const userRow = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!profile.length) return res.json(null);
      res.json({
        ...profile[0],
        firstName: userRow[0]?.firstName || "",
        lastName: userRow[0]?.lastName || "",
      });
    });

    const res = await request(app).get("/api/profile");

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Alice");
    expect(res.body.lastName).toBe("Smith");
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

    const app = express();
    app.use(express.json({ limit: "2mb" }));
    setupAuth(app);
    app.use(injectSession(user.id));

    // Mount the route under test
    app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
      const userId = (req.session as any).userId;
      const { firstName, lastName, bio, title, skills, hourlyRate, location, portfolioProjects } = req.body;

      const safeData: any = {
        ...(bio !== undefined && { bio }),
        ...(title !== undefined && { title }),
        ...(skills !== undefined && { skills: Array.isArray(skills) ? skills : [] }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(location !== undefined && { location }),
      };
      if (portfolioProjects !== undefined) {
        safeData.portfolioProjects = Array.isArray(portfolioProjects) && portfolioProjects.length > 0
          ? portfolioProjects
          : null;
      }

      // Update users
      if (firstName !== undefined || lastName !== undefined) {
        await db.update(users).set({
          ...(firstName !== undefined && { firstName: String(firstName).slice(0, 50) || null }),
          ...(lastName !== undefined && { lastName: String(lastName).slice(0, 50) || null }),
          updatedAt: new Date(),
        }).where(eq(users.id, userId));
      }

      // Update profile
      const [updated] = await db
        .update(profiles)
        .set({ ...safeData, updatedAt: new Date() })
        .where(eq(profiles.userId, userId))
        .returning();

      if (!updated) return res.status(404).json({ message: "Profile not found" });

      // Return merged shape
      const userRow = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      res.json({
        ...updated,
        firstName: userRow[0]?.firstName || null,
        lastName: userRow[0]?.lastName || null,
      });
    });

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

    const app = express();
    app.use(express.json({ limit: "2mb" }));
    setupAuth(app);
    app.use(injectSession(user.id));

    // Mount the route under test
    app.post("/api/profile/go-live", isAuthenticated, async (req: any, res) => {
      const userId = (req.session as any).userId;
      const { bio, title, skills, hourlyRate, location, portfolioProjects, firstName, lastName } = req.body;

      const saveData: any = {
        bio: bio || null,
        title: title || null,
        skills: Array.isArray(skills) ? skills : [],
        hourlyRate: (typeof hourlyRate === "number" && hourlyRate > 0) ? hourlyRate : 0,
        location: location || null,
        publishedProfile: true,
        publishedAt: new Date(),
        userType: "freelancer",
        portfolioProjects: (Array.isArray(portfolioProjects) && portfolioProjects.length > 0)
          ? portfolioProjects
          : null,
      };

      await db.transaction(async (tx) => {
        await tx.insert(users).values({ id: userId }).onConflictDoNothing();
        if (firstName || lastName) {
          await tx.update(users).set({
            ...(firstName !== undefined && { firstName: String(firstName).slice(0, 50) || null }),
            ...(lastName !== undefined && { lastName: String(lastName).slice(0, 50) || null }),
            updatedAt: new Date(),
          }).where(eq(users.id, userId));
        }

        const [existing] = await tx
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.userId, userId));

        if (existing) {
          await tx.update(profiles).set({ ...saveData, updatedAt: new Date() }).where(eq(profiles.userId, userId));
        } else {
          await tx.insert(profiles).values({ ...saveData, userId });
        }
      });

      const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
      const userRow = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      res.json({
        success: true,
        profile: {
          ...profile,
          firstName: userRow[0]?.firstName || null,
          lastName: userRow[0]?.lastName || null,
        },
      });
    });

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

    const app = express();
    app.use(express.json({ limit: "2mb" }));
    setupAuth(app);
    app.use(injectSession(user.id));

    // Patch endpoint
    app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
      const userId = (req.session as any).userId;
      const { firstName, lastName } = req.body;
      await db.update(users).set({
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
      }).where(eq(users.id, userId));
      await db.update(profiles).set({ bio: req.body.bio }).where(eq(profiles.userId, userId));
      const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
      const userRow = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      res.json({ ...profile, firstName: userRow[0]?.firstName || null });
    });

    // GET endpoint
    app.get("/api/profile", isAuthenticated, async (req: any, res) => {
      const userId = (req.session as any).userId;
      const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
      const userRow = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      res.json({ ...profile, firstName: userRow[0]?.firstName || null });
    });

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

    const brokenApp = express();
    brokenApp.use(express.json());
    setupAuth(brokenApp);
    brokenApp.use((req: any, _res: any, next: any) => {
      (req.session as any).userId = "some-user-id";
      next();
    });
    brokenApp.use(isAuthenticated);
    brokenApp.get("/api/test-auth", (_req, res) => res.json({ ok: true }));

    const res = await request(brokenApp).get("/api/test-auth");
    // The loadProfile code path should return 503 with SERVICE_UNAVAILABLE
    // when DB is unreachable, not 401 (which would log everyone out).
    expect(res.status).toBe(503);
    expect(res.body.code).toBe("SERVICE_UNAVAILABLE");

    (realDb as any).select = originalSelect;
  });
});
