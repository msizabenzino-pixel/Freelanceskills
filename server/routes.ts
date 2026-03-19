import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health endpoint
  app.get("/api/health", async (_req, res) => {
    try {
      // Check database connection
      const { sql } = await import("drizzle-orm");
      const { db } = await import("./db");
      await db.execute(sql`SELECT 1`);
      
      const status = {
        status: "ok",
        uptime: process.uptime(),
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        dependencies: {
          database: "connected",
          payfast: process.env.PAYFAST_MERCHANT_ID ? "configured" : "missing",
          ai: (process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) ? "configured" : "missing",
        }
      };
      res.json(status);
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Metrics endpoint
  app.get("/api/metrics", async (_req, res) => {
    try {
      const { metrics } = await import("./index");
      const stats = await storage.getGlobalStats();
      
      res.json({
        ...stats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        requests: {
          total: metrics.totalRequests,
          byPrefix: metrics.requestsByPrefix
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Setup authentication FIRST
  await setupAuth(app);
  registerAuthRoutes(app);
  const { isAuthenticated } = await import("./replit_integrations/auth");
  const { insertJobSchema, insertProfileSchema, insertServicePackageSchema, insertBookingSchema, insertReviewSchema, insertMessageSchema } = await import("@shared/schema");
  const { checkMessageSafety, SAFETY_DISCLAIMERS, REPORT_REASONS } = await import("@shared/safety");
  const { registerGrowthRoutes } = await import("./growth");
  registerGrowthRoutes(app, isAuthenticated);
  const { registerVisionRoutes } = await import("./vision");
  registerVisionRoutes(app, isAuthenticated);
  const { registerEdgeCaseRoutes } = await import("./edge-cases");
  registerEdgeCaseRoutes(app, isAuthenticated);
  const { registerVictoryLapRoutes } = await import("./victory-lap");
  registerVictoryLapRoutes(app, isAuthenticated);
  const { registerAdminRoutes } = await import("./adminRoutes");
  registerAdminRoutes(app, isAuthenticated);
  const { registerAnalyticsRoutes } = await import("./analyticsRoutes");
  registerAnalyticsRoutes(app, isAuthenticated);
  const { registerFreelancerRoutes } = await import("./freelancerRoutes");
  registerFreelancerRoutes(app);
  const { registerClientRoutes } = await import("./clientRoutes");
  registerClientRoutes(app);
  const { registerPaymentsRoutes } = await import("./paymentsRoutes");
  registerPaymentsRoutes(app);
  const { registerAcademyAdminRoutes } = await import("./academyAdminRoutes");
  registerAcademyAdminRoutes(app);
  const { registerSystemSettingsRoutes } = await import("./systemSettingsRoutes");
  registerSystemSettingsRoutes(app);
  const { registerGigsRoutes } = await import("./gigsRoutes");
  registerGigsRoutes(app);
  const { registerProposalRoutes } = await import("./proposalRoutes");
  registerProposalRoutes(app);
  const { registerOrderRoutes } = await import("./orderRoutes");
  registerOrderRoutes(app);
  const { registerFinanceRoutes } = await import("./financeRoutes");
  registerFinanceRoutes(app);
  const { registerDisputeRoutes } = await import("./disputeRoutes");
  registerDisputeRoutes(app);
  const { registerSupportRoutes } = await import("./supportRoutes");
  registerSupportRoutes(app);
  const { registerReportRoutes } = await import("./reportRoutes");
  registerReportRoutes(app);
  const { registerNotificationsRoutes } = await import("./notificationsRoutes");
  registerNotificationsRoutes(app);
  const { registerCategoryRoutes } = await import("./categoryRoutes");
  registerCategoryRoutes(app);
  const { registerModerationRoutes } = await import("./moderationRoutes");
  registerModerationRoutes(app);
  const { registerPromotionRoutes } = await import("./promotionRoutes");
  registerPromotionRoutes(app);

  const { registerMarketingRoutes } = await import("./marketingRoutes");
  registerMarketingRoutes(app);

  const { registerSubscriptionRoutes } = await import("./subscriptionRoutes");
  registerSubscriptionRoutes(app);

  const { registerSecurityRoutes } = await import("./securityRoutes");
  registerSecurityRoutes(app);

  const { registerAuditLogsRoutes, auditLogMiddleware } = await import("./auditLogsRoutes");
  auditLogMiddleware(app);
  registerAuditLogsRoutes(app);

  const { registerCmsRoutes } = await import("./cmsRoutes");
  registerCmsRoutes(app, isAuthenticated);

  const { registerFeatureFlagsRoutes } = await import("./featureFlagsRoutes");
  await registerFeatureFlagsRoutes(app, isAuthenticated);

  const { registerRolesRoutes } = await import("./rolesRoutes");
  await registerRolesRoutes(app, isAuthenticated);

  // Dashboard Stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const profile = await storage.getProfile(userId);
      const bookings = await storage.getUserBookings(userId);
      const allJobs = await storage.getAllJobs();
      
      const stats: any = {
        role: profile?.userType || "client",
      };

      if (stats.role === "client" || stats.role === "both") {
        const myJobs = allJobs.filter(j => j.clientId === userId);
        const myBookings = bookings.filter(b => b.clientId === userId);
        const completedBookings = myBookings.filter(b => b.status === "completed");
        
        stats.client = {
          activeJobs: myJobs.map(j => ({
            ...j,
            applicantCount: 0, // Placeholder, would need application counts
          })),
          escrowBalance: myBookings
            .filter(b => b.status === "confirmed" || b.status === "in_progress" || b.status === "delivered")
            .reduce((sum, b) => sum + b.totalAmount, 0),
          totalSpent: completedBookings.reduce((sum, b) => sum + b.totalAmount, 0),
          activeProjectsCount: myBookings.filter(b => b.status === "in_progress" || b.status === "delivered").length,
          avgRatingGiven: 0, // Placeholder
        };
      }

      if (stats.role === "freelancer" || stats.role === "both") {
        const myBookings = bookings.filter(b => b.freelancerId === userId);
        const completedBookings = myBookings.filter(b => b.status === "completed");
        const referralStats = await storage.getReferralStats(userId);
        
        stats.freelancer = {
          totalEarned: completedBookings.reduce((sum, b) => sum + b.totalAmount, 0),
          pendingPayouts: myBookings
            .filter(b => b.status === "confirmed" || b.status === "in_progress" || b.status === "delivered")
            .reduce((sum, b) => sum + b.totalAmount, 0),
          thisMonthEarnings: completedBookings
            .filter(b => b.createdAt && new Date(b.createdAt).getMonth() === new Date().getMonth())
            .reduce((sum, b) => sum + b.totalAmount, 0),
          referralStats,
          activeGigs: myBookings.filter(b => b.status === "in_progress" || b.status === "delivered"),
          earningsHistory: [ // Placeholder for chart
            { month: "Jan", amount: 0 },
            { month: "Feb", amount: 0 },
            { month: "Mar", amount: 0 },
            { month: "Apr", amount: 0 },
            { month: "May", amount: 0 },
            { month: "Jun", amount: 0 },
          ]
        };
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (_req, res) => {
    try {
      const allJobs = await storage.getAllJobs();
      const jobsWithNames = await Promise.all(
        allJobs.map(async (job) => {
          try {
            const profile = await storage.getProfile(job.clientId);
            return {
              ...job,
              clientName: profile?.title || profile?.bio?.substring(0, 30) || "FreelanceSkills Client",
            };
          } catch {
            return { ...job, clientName: "FreelanceSkills Client" };
          }
        })
      );
      res.json(jobsWithNames);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertJobSchema.parse(req.body);
      
      const job = await storage.createJob({
        ...validatedData,
        clientId: userId,
      });
      
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { status, freelancerId } = req.body;
      const job = await storage.updateJobStatus(req.params.id, status, freelancerId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get("/api/profile/:id", async (req, res) => {
    try {
      const profile = await storage.getProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile by id:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertProfileSchema.parse(req.body);
      
      const profile = await storage.createProfile({
        ...validatedData,
        userId,
      });
      
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { userId: _u, id: _i, isPro: _p, ...safeData } = req.body;
      const profile = await storage.updateProfile(userId, safeData);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/freelancers", async (req, res) => {
    try {
      const { location } = req.query;
      const freelancers = await storage.searchFreelancers(undefined, location as string);
      res.json(freelancers);
    } catch (error) {
      console.error("Error searching freelancers:", error);
      res.status(500).json({ message: "Failed to search freelancers" });
    }
  });

  // ============ TASKRABBIT-STYLE FEATURES ============

  // Service Package routes (instant booking)
  app.get("/api/packages", async (req, res) => {
    try {
      const { category } = req.query;
      const packages = await storage.getAllPackages(category as string);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const pkg = await storage.getServicePackage(req.params.id);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });

  app.post("/api/packages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertServicePackageSchema.parse(req.body);
      
      const pkg = await storage.createServicePackage({
        ...validatedData,
        freelancerId: userId,
      });
      
      res.status(201).json(pkg);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.get("/api/freelancers/:id/packages", async (req, res) => {
    try {
      const packages = await storage.getFreelancerPackages(req.params.id);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching freelancer packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertBookingSchema.parse(req.body);

      // --- FRAUD CHECK ---
      const profile = await storage.getProfile(userId);
      const fraudCheckResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/ai/fraud-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationData: {
            userId,
            jobBudget: validatedData.totalAmount,
            description: validatedData.notes || "",
            freelancerId: validatedData.freelancerId,
            accountCreatedAt: profile?.createdAt,
            // In a real app, we'd get this from IP/headers
            currentLocation: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          }
        })
      });

      const fraudData = await fraudCheckResponse.json();

      if (fraudData.riskScore > 70) {
        // Log the fraud attempt
        await storage.createFraudFlag({
          userId,
          bookingId: null,
          riskScore: fraudData.riskScore,
          flags: fraudData.flags,
          recommendation: "reject",
        });
        return res.status(403).json({ 
          message: "Booking rejected for safety reasons. Our system detected high risk patterns.",
          riskScore: fraudData.riskScore,
          flags: fraudData.flags
        });
      }

      const booking = await storage.createBooking({
        ...validatedData,
        clientId: userId,
      });

      // If risk is medium, flag it but proceed
      if (fraudData.riskScore >= 40) {
        await storage.createFraudFlag({
          userId,
          bookingId: booking.id,
          riskScore: fraudData.riskScore,
          flags: fraudData.flags,
          recommendation: "review",
        });
      }
      // --- END FRAUD CHECK ---
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { status } = req.body;
      
      // Get the booking first to check ownership
      const existingBooking = await storage.getBooking(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Authorization: only client or freelancer can update booking status
      if (existingBooking.clientId !== userId && existingBooking.freelancerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const booking = await storage.updateBookingStatus(req.params.id, status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // AI Task Assistant multi-turn chat endpoint
  app.post("/api/ai/task-chat", async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;
      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

      if (!apiKey) {
        return res.status(500).json({ message: "AI API key not configured" });
      }

      const systemPrompt = `You are the FreelanceSkills AI Task Assistant. Your goal is to help users refine their task requirements, suggest budgets, and prepare to hire a freelancer.
FreelanceSkills is a South African freelance marketplace.

Budget Estimation Rules (SA Market Rates):
- General Labor/Cleaning: R150 - R300 per hour
- Skilled Trades (Plumbing/Electrical): R400 - R800 per hour call-out + labor
- Professional Services (Design/Writing): R300 - R1000 per hour
- Specialized Tech/Consulting: R800 - R2500+ per hour

Guidelines:
- Discuss the task details to identify skill gaps.
- Suggest budget adjustments based on SA market rates.
- Recommend types of freelancers (e.g., "You need a Level 2 Electrician").
- When the user is ready, offer to create a job post.
- Be professional, helpful, and concise.
- Use South African English and Rand (R) for currency.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: message }
      ];

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      res.json({ message: aiResponse });
    } catch (error) {
      console.error("Error in task-chat:", error);
      res.status(500).json({ message: "I'm having trouble processing your request. Please try again." });
    }
  });

  // Fraud detection memory
  const paymentAttempts = new Map<string, { count: number, lastReset: number }>();
  const BOOKING_LIMIT_PER_HOUR = 5;

  function checkVelocity(userId: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const userAttempts = paymentAttempts.get(userId) || { count: 0, lastReset: now };

    if (now - userAttempts.lastReset > windowMs) {
      userAttempts.count = 1;
      userAttempts.lastReset = now;
    } else {
      userAttempts.count++;
    }

    paymentAttempts.set(userId, userAttempts);
    return userAttempts.count <= BOOKING_LIMIT_PER_HOUR;
  }

  // AI Fraud Detection endpoint
  app.post("/api/ai/fraud-check", async (req, res) => {
    try {
      const { applicationData } = req.body;
      const userId = (req.session as any)?.userId || "anonymous";
      let riskScore = 0;
      const flags: string[] = [];

      // 1. Velocity checks
      if (!checkVelocity(userId)) {
        riskScore += 50;
        flags.push("High velocity: >5 payment attempts in 1 hour");
      }

      // 2. Amount anomaly
      if (applicationData.userId) {
        const userBookings = await storage.getUserBookings(applicationData.userId);
        const completedBookings = userBookings.filter(b => b.status === 'completed');
        if (completedBookings.length > 0) {
          const avgAmount = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0) / completedBookings.length;
          if (applicationData.jobBudget > avgAmount * 3) {
            riskScore += 40;
            flags.push(`Amount anomaly: ${applicationData.jobBudget} is >3x user's average ${avgAmount.toFixed(0)}`);
          }
        }
      }

      // 3. Geographic mismatch (simulated with profile location vs provided location)
      if (applicationData.userId && applicationData.currentLocation) {
        const profile = await storage.getProfile(applicationData.userId);
        const profileLocation = profile?.location;
        if (profileLocation && !applicationData.currentLocation.toLowerCase().includes(profileLocation.toLowerCase())) {
          riskScore += 25;
          flags.push(`Geographic mismatch: Profile says ${profileLocation}, current location ${applicationData.currentLocation}`);
        }
      }

      // 4. Duplicate detection
      if (applicationData.userId && applicationData.freelancerId) {
        const userBookings = await storage.getUserBookings(applicationData.userId);
        const recentDuplicateBookings = userBookings.filter(b => {
          if (!b.createdAt) return false;
          return b.freelancerId === applicationData.freelancerId && 
            (new Date().getTime() - new Date(b.createdAt).getTime()) < 24 * 60 * 60 * 1000;
        });
        if (recentDuplicateBookings.length > 3) {
          riskScore += 35;
          flags.push("Duplicate detection: >3 bookings with same freelancer in 24 hours");
        }
      }

      // 5. Pattern matching (scam keywords)
      const scamKeywords = ["advance fee", "urgent transfer", "Western Union", "money mule", "overpayment", "off-platform"];
      const description = (applicationData.description || "").toLowerCase();
      const foundKeywords = scamKeywords.filter(kw => description.includes(kw.toLowerCase()));
      if (foundKeywords.length > 0) {
        riskScore += 45;
        flags.push(`Pattern matching: Found scam keywords (${foundKeywords.join(", ")})`);
      }

      // Existing simple rule-based logic
      const now = new Date();
      const accountCreatedAtValue = applicationData.accountCreatedAt as any;
      const accountCreated = accountCreatedAtValue ? new Date(accountCreatedAtValue) : now;
      const accountAgeHours = (now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60);

      // Rule: New account (<24h) applying to high-value job (>R50,000)
      if (accountAgeHours < 24 && applicationData.jobBudget > 50000) {
        riskScore += 30;
        flags.push("New account applying to high-value job");
      }

      // Rule: All caps description
      if (description === (applicationData.description || "").toUpperCase() && (applicationData.description || "").length > 20) {
        riskScore += 15;
        flags.push("All caps description");
      }

      let recommendation: "approve" | "review" | "reject" = "approve";
      if (riskScore > 70) {
        recommendation = "reject";
      } else if (riskScore >= 40) {
        recommendation = "review";
      }

      res.json({ riskScore, flags, recommendation });
    } catch (error) {
      console.error("Error in fraud-check:", error);
      res.status(500).json({ message: "Failed to perform fraud check" });
    }
  });

      // Admin Fraud Routes
  app.get("/api/admin/fraud-flags", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const userProfile = await storage.getProfile(userId);
      if ((userProfile as any)?.role !== "admin" && userId !== "user_2Pz69BfA5yS3R8M") { // Fixed admin check or specific ID
        return res.status(403).json({ message: "Admin access required" });
      }
      const flags = await storage.getUnresolvedFraudFlags();
      res.json(flags);
    } catch (error) {
      console.error("Error fetching fraud flags:", error);
      res.status(500).json({ message: "Failed to fetch fraud flags" });
    }
  });

  app.patch("/api/admin/fraud-flags/:id/resolve", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const userProfile = await storage.getProfile(userId);
      if ((userProfile as any)?.role !== "admin" && userId !== "user_2Pz69BfA5yS3R8M") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { resolution } = req.body; // "approved", "rejected", "escalated"
      const flag = await storage.resolveFraudFlag(parseInt(req.params.id), resolution, userId);
      res.json(flag);
    } catch (error) {
      console.error("Error resolving fraud flag:", error);
      res.status(500).json({ message: "Failed to resolve fraud flag" });
    }
  });

  // Escrow Release Endpoint
  app.post("/api/bookings/:id/release", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Authorization: only the client can release funds (or admin)
      if (booking.clientId !== userId) {
        const userProfile = await storage.getProfile(userId);
        if ((userProfile as any)?.role !== "admin") {
          return res.status(403).json({ message: "Only the client can release funds" });
        }
      }

      // Final fraud check before release
      const flags = await storage.getFraudFlagsByBooking(booking.id);
      const unresolvedFlags = flags.filter(f => !f.resolvedAt);

      if (unresolvedFlags.length > 0) {
        return res.status(403).json({ 
          message: "Funds release blocked due to unresolved fraud flags. Please contact support.",
          flags: unresolvedFlags
        });
      }

      const updatedBooking = await storage.updateBookingStatus(booking.id, "completed");
      res.json({ message: "Funds released successfully", booking: updatedBooking });
    } catch (error) {
      console.error("Error releasing funds:", error);
      res.status(500).json({ message: "Failed to release funds" });
    }
  });
  // Review routes
  app.get("/api/freelancers/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getFreelancerReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertReviewSchema.parse(req.body);
      
      const review = await storage.createReview({
        ...validatedData,
        reviewerId: userId,
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Messaging routes (secure in-app chat)
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const conversations = await storage.getUserConversations(userId);
      
      const conversationsWithProfiles = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
          const otherProfile = await storage.getProfile(otherUserId);
          const messages = await storage.getConversationMessages(conv.id);
          const lastMessage = messages[messages.length - 1];
          const unreadCount = messages.filter(m => m.senderId !== userId && !m.isRead).length;

          return {
            ...conv,
            otherUser: {
              id: otherUserId,
              name: otherProfile?.title || "Freelancer",
              avatar: (otherProfile as any)?.avatarUrl,
              role: (otherProfile as any)?.category || "Professional",
            },
            lastMessage: lastMessage?.content || "",
            unreadCount,
          };
        })
      );

      res.json(conversationsWithProfiles);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { recipientId, jobId } = req.body;
      
      const conversation = await storage.getOrCreateConversation(userId, recipientId, jobId);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Authorization: only participants can view messages
      if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getConversationMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      
      // Safety check on message content
      const safetyResult = checkMessageSafety(req.body.content || "");
      
      if (!safetyResult.isClean) {
        const blockedViolations = safetyResult.violations.filter(v => v.severity === 'blocked');
        if (blockedViolations.length > 0) {
          return res.status(400).json({ 
            message: "Message blocked for safety reasons",
            violations: blockedViolations,
            hint: "For your protection, sharing contact details and requesting off-platform payments is not allowed."
          });
        }
      }
      
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        content: safetyResult.sanitizedContent,
        conversationId: req.params.id,
        senderId: userId,
      });
      
      const message = await storage.sendMessage(validatedData);
      res.status(201).json({
        ...message,
        safetyWarnings: safetyResult.violations.filter(v => v.severity === 'warning'),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Safety & Trust endpoints
  app.get("/api/safety/disclaimers", (_req, res) => {
    res.json(SAFETY_DISCLAIMERS);
  });

  app.get("/api/safety/report-reasons", (_req, res) => {
    res.json(REPORT_REASONS);
  });

  app.post("/api/safety/check-content", (req, res) => {
    const { content } = req.body;
    const result = checkMessageSafety(content || "");
    res.json(result);
  });

  // AI Support Chat endpoint
  app.post("/api/ai/support-chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

      if (!apiKey) {
        return res.status(500).json({ message: "AI API key not configured" });
      }

      const systemPrompt = `You are the FreelanceSkills AI Support Bot. You help users with questions about the FreelanceSkills platform.
FreelanceSkills is a South African freelance marketplace (similar to Upwork/TaskRabbit).

Pricing & Commission:
- Free Plan: R0/month, 10% commission on completed jobs.
- Premium Talent: R79/month, 5% commission, priority in search, Pro badge.
- Enterprise: Custom pricing for large teams and high-volume hiring.

Key Features & How-To:
- Posting Jobs: Click "Post a Job" in the navbar. AI can help generate descriptions.
- Finding Work: Browse the "Job Board" or use the "AI Opportunity Finder".
- Subscriptions: Users can upgrade to Premium for lower commissions and better visibility.
- Escrow & Payments: We use a secure escrow system. Client pays upfront, funds are held by FreelanceSkills, and released when work is approved.
- CV Upload: Users can upload a CV (PDF/Word) to automatically generate their profile using AI.
- Verification: Basic (email/phone) and Full (ID, qualifications, professional body check). Verified profiles get more work.

Guidelines:
- Be professional, helpful, and concise.
- Use South African English/terminology where appropriate (e.g., R for Rand).
- If the user asks for a human, agent, or support, or if you have exchanged 3 or more messages in this conversation, you MUST provide the WhatsApp handoff.
- WhatsApp Handoff: "Chat with our team on WhatsApp for instant help: https://wa.me/27601234567"

Current Conversation History:
${history.map((m: any) => `${m.role}: ${m.content}`).join("\n")}
User: ${message}`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      res.json({ message: aiResponse });
    } catch (error) {
      console.error("Error in support-chat:", error);
      res.status(500).json({ message: "I'm having trouble connecting to my brain right now. Please try again or contact support via WhatsApp: https://wa.me/27601234567" });
    }
  });

  // ============ VERIFICATION & VETTING SYSTEM ============
  
  const { VERIFICATION_LEVELS, SA_PROFESSIONAL_BODIES, CONCERN_CATEGORIES } = await import("@shared/schema");
  
  // Get verification status for a freelancer
  app.get("/api/freelancers/:id/verification", async (req, res) => {
    try {
      const verification = await storage.getFreelancerVerification(req.params.id);
      res.json(verification || { 
        verificationLevel: "unverified", 
        verificationScore: 0,
        identityVerified: false,
        qualificationsVerified: false,
        experienceVerified: false,
        professionalBodyVerified: false,
        backgroundCheckCompleted: false,
      });
    } catch (error) {
      console.error("Error fetching verification:", error);
      res.status(500).json({ message: "Failed to fetch verification status" });
    }
  });

  // Submit verification documents (freelancer submits for review)
  app.post("/api/verification/submit", isAuthenticated, async (req: any, res) => {
    try {
      const freelancerId = (req.session as any).userId;
      const { 
        verificationType, // 'identity', 'qualifications', 'experience', 'professional_body'
        documentUrls,
        professionalBodyCode,
        registrationNumber,
        claimedYearsExperience,
        referenceContacts,
      } = req.body;

      // In a real implementation, this would queue for manual review
      // For now, we'll create/update the verification record
      const verification = await storage.submitVerification(freelancerId, {
        verificationType,
        documentUrls,
        professionalBodyCode,
        registrationNumber,
        claimedYearsExperience,
        referenceContacts,
      });

      res.json({ 
        message: "Verification documents submitted for review. You will be notified within 2-3 business days.",
        verification 
      });
    } catch (error) {
      console.error("Error submitting verification:", error);
      res.status(500).json({ message: "Failed to submit verification" });
    }
  });

  // Get professional bodies list
  app.get("/api/verification/professional-bodies", (_req, res) => {
    res.json(SA_PROFESSIONAL_BODIES);
  });

  // Get verification levels info
  app.get("/api/verification/levels", (_req, res) => {
    res.json(VERIFICATION_LEVELS);
  });

  // ============ PRIVATE FEEDBACK SYSTEM (Fiverr-style double testimonial) ============
  
  // Submit private feedback after order completion
  app.post("/api/bookings/:id/private-feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const bookingId = req.params.id;
      
      // Verify user was part of this booking
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.clientId !== userId && booking.freelancerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const revieweeId = booking.clientId === userId ? booking.freelancerId : booking.clientId;

      const feedback = await storage.submitPrivateFeedback({
        bookingId,
        reviewerId: userId,
        revieweeId,
        privateRating: req.body.privateRating,
        wouldRecommend: req.body.wouldRecommend,
        wouldHireAgain: req.body.wouldHireAgain,
        communicationRating: req.body.communicationRating,
        professionalismRating: req.body.professionalismRating,
        qualityRating: req.body.qualityRating,
        valueRating: req.body.valueRating,
        privateComments: req.body.privateComments,
        concernsRaised: req.body.concernsRaised || [],
        flaggedForReview: (req.body.concernsRaised || []).length > 0,
      });

      res.json({ 
        message: "Thank you for your private feedback. This helps us maintain quality on the platform.",
        feedback 
      });
    } catch (error) {
      console.error("Error submitting private feedback:", error);
      res.status(500).json({ message: "Failed to submit private feedback" });
    }
  });

  // Check if private feedback is pending for a booking
  app.get("/api/bookings/:id/feedback-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const bookingId = req.params.id;
      
      const hasPublicReview = await storage.hasPublicReview(bookingId, userId);
      const hasPrivateFeedback = await storage.hasPrivateFeedback(bookingId, userId);
      
      res.json({
        hasPublicReview,
        hasPrivateFeedback,
        feedbackComplete: hasPublicReview && hasPrivateFeedback,
      });
    } catch (error) {
      console.error("Error checking feedback status:", error);
      res.status(500).json({ message: "Failed to check feedback status" });
    }
  });

  // Get concern categories for private feedback
  app.get("/api/feedback/concern-categories", (_req, res) => {
    res.json(CONCERN_CATEGORIES);
  });

  // ============ AI-POWERED MATCHING ============
  
  app.post("/api/ai/match-taskers", isAuthenticated, async (req, res) => {
    try {
      const { taskDescription, category, location, budget, urgency } = req.body;
      
      // Get all freelancers
      const freelancers = await storage.searchFreelancers(undefined, location);
      
      // AI scoring algorithm
      const scoredFreelancers = freelancers.map((freelancer) => {
        let score = 0;
        let reasons: string[] = [];
        
        // Rating score (0-30 points)
        const ratingScore = (freelancer.rating || 0) / 500 * 30;
        score += ratingScore;
        if (ratingScore > 25) reasons.push("Top-rated professional");
        
        // Experience score (0-25 points)
        const experienceScore = Math.min(freelancer.completedJobs * 2.5, 25);
        score += experienceScore;
        if (freelancer.completedJobs > 10) reasons.push(`${freelancer.completedJobs} completed jobs`);
        
        // Pro status bonus (10 points)
        if (freelancer.isPro) {
          score += 10;
          reasons.push("Pro verified member");
        }
        
        // Location match (20 points for exact, 10 for partial)
        if (location && freelancer.location) {
          if (freelancer.location.toLowerCase().includes(location.toLowerCase())) {
            score += 20;
            reasons.push("Local professional");
          }
        }
        
        // Budget compatibility (15 points)
        if (budget && freelancer.hourlyRate) {
          const rateRatio = budget / (freelancer.hourlyRate / 100);
          if (rateRatio >= 0.8 && rateRatio <= 1.5) {
            score += 15;
            reasons.push("Within budget");
          } else if (rateRatio >= 0.5) {
            score += 8;
          }
        }
        
        // Urgency bonus for available taskers
        if (urgency === "same-day") {
          score += 5;
          reasons.push("Available today");
        }
        
        return {
          ...freelancer,
          matchScore: Math.min(Math.round(score), 100),
          matchReasons: reasons,
          estimatedResponseTime: freelancer.isPro ? "< 1 hour" : "< 4 hours",
        };
      });
      
      // Sort by match score
      const rankedFreelancers = scoredFreelancers
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);
      
      res.json({
        matches: rankedFreelancers,
        aiInsights: {
          totalMatches: rankedFreelancers.length,
          topMatch: rankedFreelancers[0]?.matchScore || 0,
          averageRating: freelancers.length > 0 
            ? (freelancers.reduce((sum, f) => sum + (f.rating || 0), 0) / freelancers.length / 100).toFixed(1)
            : "N/A",
          recommendation: rankedFreelancers.length > 0 
            ? `We found ${rankedFreelancers.length} great matches for your task. The top candidate has a ${rankedFreelancers[0]?.matchScore}% match score.`
            : "No matches found. Try expanding your search criteria.",
        }
      });
    } catch (error) {
      console.error("Error matching taskers:", error);
      res.status(500).json({ message: "Failed to match taskers" });
    }
  });

  // AI-powered job description generator
  app.post("/api/ai/generate-description", isAuthenticated, async (req, res) => {
    try {
      const { title, category, locationType } = req.body;
      
      const templates: Record<string, string> = {
        trades: `We are seeking an experienced ${title} to assist with our project in South Africa.\n\nKey Responsibilities:\n- Deliver professional, high-quality work that meets local building standards\n- Ensure compliance with safety regulations and SANS codes\n- Communicate clearly about timeline and requirements\n- Provide all necessary certificates upon completion\n\nRequirements:\n- Valid trade certification/registration\n- Proven track record with verifiable references\n- Own tools and reliable transportation\n- Professional liability insurance preferred`,
        
        cleaning: `Looking for a reliable ${title} for ${locationType === 'onsite' ? 'our premises' : 'regular service'}.\n\nScope of Work:\n- Thorough cleaning to the highest standards\n- Use of eco-friendly products when possible\n- Attention to detail in all areas\n- Flexible scheduling available\n\nRequirements:\n- Previous cleaning experience\n- Professional attitude\n- Own transport`,
        
        safety: `We require a certified ${title} for compliance purposes.\n\nResponsibilities:\n- Conduct thorough safety audits and inspections\n- Prepare compliance documentation and certificates\n- Identify hazards and recommend corrective actions\n- Ensure adherence to OHS Act and SANS standards\n\nRequirements:\n- SAMTRAC or equivalent qualification\n- Registered with relevant professional body\n- Experience in similar environments\n- Strong documentation skills`,
        
        default: `We are looking for an experienced ${title} to join our project.\n\nKey Responsibilities:\n- Deliver high-quality work according to specifications\n- Collaborate effectively with our team in South Africa\n- Adhere to safety and compliance standards\n- Meet agreed-upon deadlines\n\nRequirements:\n- Proven experience in the field\n- Relevant certifications/qualifications\n- Excellent communication skills\n- Reliability and professionalism`,
      };
      
      const description = templates[category?.toLowerCase()] || templates.default;
      
      res.json({ description });
    } catch (error) {
      console.error("Error generating description:", error);
      res.status(500).json({ message: "Failed to generate description" });
    }
  });

  // AI budget estimation
  app.post("/api/ai/estimate-budget", isAuthenticated, async (req, res) => {
    try {
      const { title, category, duration, location } = req.body;
      
      // Market rate database (ZAR)
      const baseRates: Record<string, { min: number; max: number; unit: string }> = {
        trades: { min: 350, max: 800, unit: "hour" },
        cleaning: { min: 150, max: 400, unit: "hour" },
        safety: { min: 2500, max: 8000, unit: "day" },
        tech: { min: 500, max: 1500, unit: "hour" },
        creative: { min: 300, max: 1200, unit: "hour" },
        moving: { min: 1200, max: 3500, unit: "half-day" },
        default: { min: 250, max: 750, unit: "hour" },
      };
      
      const rate = baseRates[category?.toLowerCase()] || baseRates.default;
      
      // Location adjustment (metro areas typically higher)
      let locationMultiplier = 1;
      const metroAreas = ["johannesburg", "cape town", "pretoria", "durban", "sandton"];
      if (location && metroAreas.some(m => location.toLowerCase().includes(m))) {
        locationMultiplier = 1.2;
      }
      
      const estimated = {
        low: Math.round(rate.min * locationMultiplier),
        high: Math.round(rate.max * locationMultiplier),
        recommended: Math.round((rate.min + rate.max) / 2 * locationMultiplier),
        unit: rate.unit,
        insight: `Based on current South African market rates for ${category || 'similar services'} in ${location || 'your area'}. Pro tip: Offering fair rates attracts top-rated professionals faster.`,
      };
      
      res.json(estimated);
    } catch (error) {
      console.error("Error estimating budget:", error);
      res.status(500).json({ message: "Failed to estimate budget" });
    }
  });

  // AI Recommendation routes
  const { analyzeTaskAndRecommend, suggestServicePackages, analyzeTaskInputSchema, matchPackagesInputSchema } = await import("./replit_integrations/recommendations");
  
  app.post("/api/ai/analyze-task", isAuthenticated, async (req, res) => {
    try {
      const validatedInput = analyzeTaskInputSchema.parse(req.body);
      const recommendations = await analyzeTaskAndRecommend(validatedInput.taskDescription, validatedInput.location);
      res.json(recommendations);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error analyzing task:", error);
      const message = error?.status === 401 || error?.code === "invalid_api_key"
        ? "AI service is temporarily unavailable. Please try again later."
        : "Failed to analyze task. Please try again.";
      res.status(500).json({ message });
    }
  });
  
  app.post("/api/ai/match-packages", isAuthenticated, async (req, res) => {
    try {
      const validatedInput = matchPackagesInputSchema.parse(req.body);
      
      // Get active service packages with freelancer info
      const allPackages = await storage.getActiveServicePackages();
      const packagesWithDetails = await Promise.all(
        allPackages.slice(0, 50).map(async (pkg) => {
          const profile = await storage.getProfile(pkg.freelancerId);
          return {
            id: pkg.id,
            title: pkg.title,
            description: pkg.description,
            category: pkg.category,
            price: pkg.price,
            freelancerName: profile?.title || undefined,
            rating: profile?.rating ?? undefined,
          };
        })
      );
      
      const matches = await suggestServicePackages(validatedInput.taskDescription, packagesWithDetails);
      res.json(matches);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error matching packages:", error);
      res.status(500).json({ message: "Failed to match packages" });
    }
  });

  // AI Proposal Helper routes
  const { generateProposalSuggestion, generateProposalInputSchema, improveProposal, improveProposalInputSchema } = await import("./replit_integrations/recommendations/proposal-helper");
  
  app.post("/api/ai/generate-proposal", isAuthenticated, async (req: any, res) => {
    try {
      const validatedInput = generateProposalInputSchema.parse(req.body);
      const proposal = await generateProposalSuggestion(validatedInput);
      res.json(proposal);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error generating proposal:", error);
      res.status(500).json({ message: "Failed to generate proposal" });
    }
  });

  app.post("/api/ai/improve-proposal", isAuthenticated, async (req: any, res) => {
    try {
      const validatedInput = improveProposalInputSchema.parse(req.body);
      const improved = await improveProposal(
        validatedInput.currentProposal,
        validatedInput.jobDescription,
        validatedInput.improvementFocus
      );
      res.json(improved);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error improving proposal:", error);
      res.status(500).json({ message: "Failed to improve proposal" });
    }
  });

  // AI Job Post Helper routes
  const { generateJobPost, generateJobPostInputSchema, improveJobPost, improveJobPostInputSchema } = await import("./replit_integrations/recommendations/job-post-helper");
  
  app.post("/api/ai/generate-job-post", isAuthenticated, async (req: any, res) => {
    try {
      const validatedInput = generateJobPostInputSchema.parse(req.body);
      const jobPost = await generateJobPost(validatedInput);
      res.json(jobPost);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error generating job post:", error);
      res.status(500).json({ message: "Failed to generate job post" });
    }
  });

  app.post("/api/ai/improve-job-post", isAuthenticated, async (req: any, res) => {
    try {
      const validatedInput = improveJobPostInputSchema.parse(req.body);
      const improved = await improveJobPost(validatedInput.title, validatedInput.description);
      res.json(improved);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error improving job post:", error);
      res.status(500).json({ message: "Failed to improve job post" });
    }
  });

  // AI Quality Check and Profile Optimization routes
  const { checkContentQuality, contentQualityCheckInputSchema, optimizeProfile, profileOptimizationInputSchema } = await import("./replit_integrations/recommendations/quality-check");
  
  app.post("/api/ai/check-quality", isAuthenticated, async (req: any, res) => {
    try {
      const validatedInput = contentQualityCheckInputSchema.parse(req.body);
      const result = await checkContentQuality(validatedInput);
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error checking content quality:", error);
      res.status(500).json({ message: "Failed to check content quality" });
    }
  });

  app.post("/api/ai/optimize-profile", isAuthenticated, async (req: any, res) => {
    try {
      const validatedInput = profileOptimizationInputSchema.parse(req.body);
      const result = await optimizeProfile(
        validatedInput.bio,
        validatedInput.title,
        validatedInput.skills,
        validatedInput.category
      );
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error optimizing profile:", error);
      res.status(500).json({ message: "Failed to optimize profile" });
    }
  });

  // ============ CV PARSING & PROFILE CREATION ============
  
  app.post("/api/cv/parse", isAuthenticated, async (req, res) => {
    try {
      const { cvText } = req.body;
      if (!cvText || cvText.trim().length < 20) {
        return res.status(400).json({ message: "Please provide your CV text (at least 20 characters)" });
      }

      const openai = new (await import("openai")).default({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert CV parser for a South African freelance marketplace. Extract structured profile information from the CV text. Return a JSON object with these fields:
- firstName (string)
- lastName (string)
- title (string - professional title like "Senior Software Developer" or "Master Electrician")
- bio (string - 2-3 sentence professional summary)
- skills (string[] - array of key skills, max 15)
- hourlyRate (number - estimated hourly rate in ZAR based on experience and South African market rates)
- location (string - city/province in South Africa)
- experienceLevel (string - "entry" | "intermediate" | "senior" | "expert")
- yearsOfExperience (number)
- category (string - best matching category from: trades, tech, creative, cleaning, safety, admin, marketing, finance, education, healthcare)
- certifications (string[] - any mentioned certifications)
Respond with ONLY the JSON object, no markdown.`
          },
          { role: "user", content: cvText }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        res.json(parsed);
      } catch (parseError) {
        console.error("Error parsing CV AI response:", content);
        res.status(500).json({ message: "AI returned invalid data format. Please try again or fill manually." });
      }
    } catch (error) {
      console.error("Error parsing CV:", error);
      res.status(500).json({ message: "Failed to parse CV. Please try again." });
    }
  });

  // ============ JOB BOARD AGGREGATOR ============

  app.get("/api/job-board", async (req, res) => {
    try {
      const { province, category, source, jobType } = req.query;
      
      const count = await storage.getAggregatedJobCount();
      
      if (count === 0) {
        try {
          const openai = new (await import("openai")).default({
            apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
            baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
          });

          const seedPrompt = `You are the FreelanceSkills Global Job Intelligence Agent. Source 20 high-quality job opportunities: 12 from South Africa across major cities (Johannesburg, Cape Town, Durban, Pretoria) and 8 international remote-first roles. Include a mix of: Software Development, Marketing, Finance, Design, Engineering, Sales, Data Science, and Customer Service. Source must be "FreelanceSkills Global". Make all jobs highly realistic with accurate salaries, real company names, and professional descriptions.
          
          Return a JSON object with a "jobs" array containing objects with these fields:
          - title (string)
          - company (string)
          - description (string - professional, 2-3 sentences)
          - requirements (string - bullet points)
          - location (string - city, country or "Remote")
          - province (string - SA province or "International")
          - salaryMin (number - monthly value in ZAR)
          - salaryMax (number - monthly value in ZAR)
          - salaryPeriod (string - "month")
          - source (string - "FreelanceSkills Global")
          - category (string)
          - jobType (string - "full-time" | "part-time" | "contract" | "remote" | "hybrid")
          - experienceLevel (string - "entry" | "intermediate" | "senior" | "executive")`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: seedPrompt },
              { role: "user", content: "Source 20 fresh global job listings across multiple categories and locations as of today." }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          });

          const content = response.choices[0]?.message?.content || '{"jobs": []}';
          const parsed = JSON.parse(content);
          const generatedJobs = parsed.jobs || [];
          
          const jobsToInsert = generatedJobs.map((job: any) => ({
            ...job,
            source: "FreelanceSkills Global",
            isActive: true,
            postedDate: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }));

          await storage.createManyAggregatedJobs(jobsToInsert);
          console.log(`Auto-seeded ${jobsToInsert.length} jobs on first load`);
        } catch (seedError) {
          console.error("Error auto-seeding jobs:", seedError);
        }
      }
      
      const jobs = await storage.getAggregatedJobs({
        province: province ? String(province) : undefined,
        category: category ? String(category) : undefined,
        source: source ? String(source) : undefined,
        jobType: jobType ? String(jobType) : undefined,
      });
      const totalCount = await storage.getAggregatedJobCount();
      res.json({ jobs, totalCount, lastUpdated: new Date().toISOString() });
    } catch (error) {
      console.error("Error fetching job board:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/job-board/refresh", async (req: any, res) => {
    try {
      const { province, category } = req.body;

      const openai = new (await import("openai")).default({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const targetProvince = province || "International";
      const targetCategory = category || "Software Development";

      const systemPrompt = `You are the FreelanceSkills Global Job Intelligence Agent. 
      Your task is to source current, high-quality job opportunities from across the entire world, with a strong focus on South Africa and remote-first international roles.
      Only include jobs that are currently active and verified.
      For the province "${targetProvince}" or global remote if applicable.
      Source must be "FreelanceSkills Global".
      Make jobs highly realistic with accurate salaries (converted to ZAR for SA roles, or USD/EUR for global), real company names, and professional descriptions.
      Include a mix of: full-time, part-time, contract, and remote positions.
      Include a mix of experience levels.
      
      Return a JSON object with a "jobs" array containing objects with these fields:
      - title (string)
      - company (string)
      - description (string - professional, detailed)
      - requirements (string - bullet points)
      - location (string - city, country or "Remote")
      - province (string - SA province or "International")
      - salaryMin (number - monthly value)
      - salaryMax (number - monthly value)
      - salaryPeriod (string - "month")
      - source (string - "FreelanceSkills Global")
      - category (string)
      - jobType (string - "full-time" | "part-time" | "contract" | "remote" | "hybrid")
      - experienceLevel (string - "entry" | "intermediate" | "senior" | "executive")`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          { role: "user", content: `Source 15-20 fresh global and local job listings for ${targetProvince}${targetCategory !== 'all' ? ` in ${targetCategory}` : ''} as of today.` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{\"jobs\": []}";
      let generatedJobs = [];
      try {
        const parsed = JSON.parse(content);
        generatedJobs = parsed.jobs || (Array.isArray(parsed) ? parsed : []);
      } catch (parseError) {
        console.error("Error parsing job refresh AI response:", content);
        return res.status(500).json({ message: "Failed to parse generated jobs" });
      }
      
      const jobsToInsert = generatedJobs.map((job: any) => ({
        ...job,
        source: "FreelanceSkills Global",
        isActive: true,
        postedDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }));

      await storage.clearOldAggregatedJobs();
      const created = await storage.createManyAggregatedJobs(jobsToInsert);

      res.json({ 
        message: `Found ${created.length} new opportunities`,
        count: created.length,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error refreshing job board:", error);
      res.status(500).json({ message: "Failed to refresh jobs. Please try again." });
    }
  });

  // ============ JOB APPLICATIONS ============

  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { jobId, aggregatedJobId, jobTitle, company, coverLetter, resumeSummary, source } = req.body;

      if (!jobTitle) {
        return res.status(400).json({ message: "Job title is required" });
      }

      const application = await storage.createJobApplication({
        userId,
        jobId,
        aggregatedJobId,
        jobTitle,
        company,
        coverLetter,
        resumeSummary,
        source,
      });

      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // ============ ACADEMY ROUTES ============

  app.get("/api/courses", async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const allCourses = await storage.getCourses();
      
      const coursesWithProgress = await Promise.all(allCourses.map(async (course) => {
        let progress = 0;
        if (userId) {
          const userProgress = await storage.getCourseProgress(userId, course.id);
          const completedCount = userProgress.filter(p => p.completed).length;
          progress = course.totalLessons > 0 ? Math.round((completedCount / course.totalLessons) * 100) : 0;
        }
        return { ...course, progress };
      }));

      res.json(coursesWithProgress);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const lessons = await storage.getCourseLessons(courseId);
      let progress: any[] = [];
      if (userId) {
        progress = await storage.getCourseProgress(userId, courseId);
      }

      const lessonsWithProgress = lessons.map(lesson => ({
        ...lesson,
        completed: progress.find(p => p.lessonId === lesson.id)?.completed || false
      }));

      res.json({ ...course, lessons: lessonsWithProgress });
    } catch (error) {
      console.error("Error fetching course details:", error);
      res.status(500).json({ message: "Failed to fetch course details" });
    }
  });

  app.post("/api/courses/:courseId/lessons/:lessonId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const courseId = parseInt(req.params.courseId);
      const lessonId = parseInt(req.params.lessonId);
      
      const progress = await storage.markLessonComplete(userId, courseId, lessonId);
      res.json(progress);
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      res.status(500).json({ message: "Failed to mark lesson complete" });
    }
  });

  app.get("/api/courses/:courseId/certificate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const courseId = parseInt(req.params.courseId);
      
      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const progress = await storage.getCourseProgress(userId, courseId);
      const completedCount = progress.filter(p => p.completed).length;

      if (completedCount < course.totalLessons) {
        return res.status(400).json({ message: "Course not completed yet" });
      }

      let cert = await storage.getCertificate(userId, courseId);
      if (!cert) {
        cert = await storage.issueCertificate({
          userId,
          courseId,
          certificateCode: `CERT-${courseId}-${userId.substring(0, 8)}-${Date.now().toString(36).toUpperCase()}`,
        });
      }

      res.json(cert);
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ message: "Failed to generate certificate" });
    }
  });

  app.get("/api/certificates/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const certificates = await storage.getUserCertificates(userId);
      
      const certsWithCourse = await Promise.all(certificates.map(async (cert) => {
        const course = await storage.getCourse(cert.courseId);
        return { ...cert, courseTitle: course?.title };
      }));

      res.json(certsWithCourse);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Seed courses if they don't exist
  async function seedCourses() {
    const existing = await storage.getCourses();
    if (existing.length === 0) {
      const course1 = await storage.createCourse({
        title: "AI Basics for Freelancers",
        description: "Master the fundamentals of AI tools to boost your productivity and earnings.",
        category: "AI Basics",
        difficulty: "beginner",
        duration: "1 hour",
        totalLessons: 5,
        isFree: true,
      });

      const course1Lessons = [
        { title: "Introduction to AI", content: "AI is transforming the freelance landscape in South Africa. This lesson covers the basics of what AI is and why it matters for your career.", orderIndex: 1, type: "text" },
        { title: "Generative AI Tools", content: "Explore tools like ChatGPT, Claude, and Midjourney that can help you create content, code, and designs faster.", orderIndex: 2, type: "text" },
        { title: "AI for Administrative Tasks", content: "Learn how to use AI to automate invoicing, scheduling, and client communication.", orderIndex: 3, type: "text" },
        { title: "Ethics and AI", content: "Understanding the importance of ethical AI use, including data privacy and avoiding bias.", orderIndex: 4, type: "text" },
        { title: "Building your AI Workflow", content: "How to integrate AI tools into your daily freelance routine for maximum efficiency.", orderIndex: 5, type: "text" },
      ];

      for (const lesson of course1Lessons) {
        await storage.createLesson({ ...lesson, courseId: course1.id });
      }

      const course2 = await storage.createCourse({
        title: "Building Your Freelance Brand",
        description: "Learn how to stand out in the crowded freelance marketplace with a strong personal brand.",
        category: "Soft Skills",
        difficulty: "beginner",
        duration: "2 hours",
        totalLessons: 4,
        isFree: true,
      });

      const course2Lessons = [
        { title: "Defining Your Niche", content: "Why specializing is better than being a generalist and how to find your unique selling proposition.", orderIndex: 1, type: "text" },
        { title: "Creating a Winning Portfolio", content: "How to showcase your work effectively to attract high-paying clients.", orderIndex: 2, type: "text" },
        { title: "Marketing Yourself", content: "Strategies for using social media and networking to find new opportunities.", orderIndex: 3, type: "text" },
        { title: "Client Retention", content: "The secret to long-term freelance success: turning one-off projects into ongoing relationships.", orderIndex: 4, type: "text" },
      ];

      for (const lesson of course2Lessons) {
        await storage.createLesson({ ...lesson, courseId: course2.id });
      }

      const course3 = await storage.createCourse({
        title: "Advanced Client Communication",
        description: "Master the art of negotiation and difficult conversations to scale your freelance business.",
        category: "Soft Skills",
        difficulty: "intermediate",
        duration: "1.5 hours",
        totalLessons: 3,
        isFree: true,
      });

      const course3Lessons = [
        { title: "Effective Onboarding", content: "How to set expectations from day one to ensure a smooth project delivery.", orderIndex: 1, type: "text" },
        { title: "Negotiating Like a Pro", content: "Techniques for discussing rates and scope without losing the client.", orderIndex: 2, type: "text" },
        { title: "Handling Conflict", content: "What to do when things go wrong: professional ways to resolve disputes and maintain your reputation.", orderIndex: 3, type: "text" },
      ];

      for (const lesson of course3Lessons) {
        await storage.createLesson({ ...lesson, courseId: course3.id });
      }
    }
  }
  
  seedCourses().catch(console.error);

  app.post("/api/ai/generate-cover-letter", isAuthenticated, async (req: any, res) => {
    try {
      const { jobTitle, company, jobDescription, userSkills, userName } = req.body;

      if (!jobTitle || !company) {
        return res.status(400).json({ message: "Job title and company are required" });
      }

      const openai = new (await import("openai")).default({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert cover letter writer for South African job applications. Write a concise, professional cover letter (3-4 paragraphs) that:
- Addresses the specific job requirements
- Highlights relevant skills
- Shows enthusiasm and cultural fit
- Uses a professional but warm South African tone
- Mentions readiness to contribute to the company
Do NOT include placeholder brackets. Write a complete, ready-to-send letter.`
          },
          { 
            role: "user", 
            content: `Write a cover letter for:
Job: ${jobTitle} at ${company}
Description: ${jobDescription || 'Not provided'}
My skills: ${userSkills || 'General professional skills'}
My name: ${userName || 'Candidate'}` 
          }
        ],
        temperature: 0.7,
      });

      res.json({ coverLetter: response.choices[0]?.message?.content || "" });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  // ============ AI OPPORTUNITY FINDER AGENT ============

  app.post("/api/opportunities/search", isAuthenticated, async (req: any, res) => {
    try {
      const { skills, interests, location, types, experienceLevel } = req.body;

      const openai = new (await import("openai")).default({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const requestedTypes = types?.length > 0 ? types.join(", ") : "jobs, apprenticeships, bursaries, learnerships, internships, graduate programmes";

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI opportunity sourcing agent for South Africa. Find and present relevant opportunities including jobs, apprenticeships, bursaries, learnerships, internships, and graduate programmes.

Generate 15 realistic opportunities that would be available in South Africa right now. Make them diverse and realistic with:
- Real-sounding SA organizations and companies
- Proper ZAR amounts for bursaries/salaries
- Realistic requirements and deadlines
- Mix of government, private sector, and NGO opportunities

Return a JSON array of objects with:
- title (string)
- organization (string - realistic SA company/institution)
- type (string - "job" | "apprenticeship" | "bursary" | "learnership" | "internship" | "graduate-programme")
- description (string - 2-3 sentences)
- requirements (string - key requirements)
- location (string - SA city/province or "Remote" or "Nationwide")
- value (string - salary range, bursary amount, or stipend e.g. "R15,000 - R25,000/month" or "Full tuition + R5,000/month stipend")
- deadline (string - realistic deadline date)
- applicationUrl (string - realistic but placeholder URL)
- sector (string - industry sector)
- matchScore (number 0-100 - how well it matches the user's profile)
- matchReason (string - why this is a good match)

Respond with ONLY the JSON array.`
          },
          { 
            role: "user", 
            content: `Find opportunities matching:
Skills: ${skills || 'General'}
Interests: ${interests || 'Open to all'}
Location: ${location || 'South Africa'}
Types: ${requestedTypes}
Experience level: ${experienceLevel || 'Any'}` 
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "[]";
      let opportunities = [];
      try {
        const parsed = JSON.parse(content);
        opportunities = Array.isArray(parsed) ? parsed : (parsed.opportunities || []);
      } catch (parseError) {
        console.error("Error parsing opportunity search AI response:", content);
        return res.status(500).json({ message: "Failed to parse opportunities" });
      }
      
      const sorted = opportunities.sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0));

      res.json({
        opportunities: sorted,
        summary: {
          total: sorted.length,
          byType: {
            jobs: sorted.filter((o: any) => o.type === "job").length,
            apprenticeships: sorted.filter((o: any) => o.type === "apprenticeship").length,
            bursaries: sorted.filter((o: any) => o.type === "bursary").length,
            learnerships: sorted.filter((o: any) => o.type === "learnership").length,
            internships: sorted.filter((o: any) => o.type === "internship").length,
            graduateProgrammes: sorted.filter((o: any) => o.type === "graduate-programme").length,
          },
          topMatch: sorted[0]?.matchScore || 0,
        }
      });
    } catch (error) {
      console.error("Error searching opportunities:", error);
      res.status(500).json({ message: "Failed to search opportunities. Please try again." });
    }
  });

  // ============ ENTERPRISE LEADS ============
  const { insertEnterpriseLeadSchema } = await import("@shared/schema");

  app.post("/api/enterprise/contact", async (req, res) => {
    try {
      const validatedData = insertEnterpriseLeadSchema.parse(req.body);
      const lead = await storage.createEnterpriseLead(validatedData);
      res.status(201).json({ message: "Thank you! Our enterprise team will contact you within 24 hours.", lead });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Error creating enterprise lead:", error);
      res.status(500).json({ message: "Failed to submit enquiry" });
    }
  });

  app.post("/api/business-invitations", async (req, res) => {
    try {
      const { businessName, category, province, city, contactPhone, contactEmail, websiteUrl, sentVia } = req.body;
      if (!businessName || !category || !province || !city) {
        return res.status(400).json({ message: "Business name, category, province, and city are required" });
      }
      const inviteCode = `FS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const invitation = await storage.createBusinessInvitation({
        businessName, category, province, city,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        websiteUrl: websiteUrl || null,
        inviteCode,
        sentVia: sentVia || null,
      });
      res.json(invitation);
    } catch (error) {
      console.error("Error creating business invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.post("/api/business-invitations/bulk", async (req, res) => {
    try {
      const { businesses } = req.body;
      if (!Array.isArray(businesses) || businesses.length === 0) {
        return res.status(400).json({ message: "businesses array is required" });
      }
      const invitations = businesses.map((b: any) => ({
        businessName: b.businessName || b.name,
        category: b.category || "trades",
        province: b.province || "Western Cape",
        city: b.city || "Cape Town",
        contactPhone: b.contactPhone || b.phone || null,
        contactEmail: b.contactEmail || b.email || null,
        websiteUrl: b.websiteUrl || b.website || null,
        inviteCode: `FS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        sentVia: b.sentVia || null,
      }));
      const created = await storage.createManyBusinessInvitations(invitations);
      res.json({ created: created.length, invitations: created });
    } catch (error) {
      console.error("Error bulk creating invitations:", error);
      res.status(500).json({ message: "Failed to create invitations" });
    }
  });

  app.get("/api/business-invitations", async (req, res) => {
    try {
      const { province, category, status } = req.query;
      const invitations = await storage.getAllBusinessInvitations({
        province: province as string | undefined,
        category: category as string | undefined,
        status: status as string | undefined,
      });
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.get("/api/business-invitations/stats", async (req, res) => {
    try {
      const stats = await storage.getBusinessInvitationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching invitation stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/business-invitations/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.json([]);
      const results = await storage.searchBusinessInvitations(q as string);
      res.json(results);
    } catch (error) {
      console.error("Error searching invitations:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get("/api/business-invitations/:code", async (req, res) => {
    try {
      const code = req.params.code as string;
      const invitation = await storage.getBusinessInvitationByCode(code);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      res.json(invitation);
    } catch (error) {
      console.error("Error fetching invitation:", error);
      res.status(500).json({ message: "Failed to fetch invitation" });
    }
  });

  app.post("/api/business-invitations/:code/claim", async (req, res) => {
    try {
      const code = req.params.code as string;
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Please log in to claim this business" });
      }
      const invitation = await storage.getBusinessInvitationByCode(code);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      if (invitation.status === "claimed") {
        return res.status(409).json({ message: "This business has already been claimed" });
      }
      const claimed = await storage.claimBusinessInvitation(code, userId);
      if (!claimed) {
        return res.status(400).json({ message: "Unable to claim this invitation" });
      }
      res.json(claimed);
    } catch (error) {
      console.error("Error claiming invitation:", error);
      res.status(500).json({ message: "Failed to claim business" });
    }
  });

  const { createPayment, getPaymentConfig, getPaymentStatus: getPayFastPaymentStatus, handleITN, isPayFastConfigured, storePaymentForRedirect, servePaymentRedirectPage } = await import("./payfast");

  app.get("/api/payfast/config", getPaymentConfig);

  app.post("/api/payfast/create-payment", async (req, res) => {
    await createPayment(req, res);
  });

  app.post("/api/payfast/store-redirect", (req, res) => {
    storePaymentForRedirect(req, res);
  });

  app.get("/api/payfast/go/:token", (req, res) => {
    servePaymentRedirectPage(req, res);
  });

  app.get("/api/payfast/payment/:paymentId", async (req, res) => {
    await getPayFastPaymentStatus(req, res);
  });

  app.post("/api/payfast/itn", async (req, res) => {
    await handleITN(req, res);
  });

  // Account operations (POPIA compliance)
  app.get("/api/account/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const userData = await storage.exportUserData(userId);
      
      res.setHeader("Content-Disposition", `attachment; filename="freelanceskills-data-export-${userId}.json"`);
      res.setHeader("Content-Type", "application/json");
      res.json(userData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.delete("/api/account/delete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      await storage.deleteUserAccount(userId);
      
      // Clear session after soft delete
      req.session.destroy();
      res.json({ message: "Account successfully deleted and personal data anonymized." });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const notification = await storage.markAsRead(parseInt(req.params.id));
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.patch("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      await storage.markAllAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const count = await storage.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  if (isPayFastConfigured()) {
    console.log("PayFast payment routes registered (including ITN webhook)");
  } else {
    console.log("PayFast credentials not configured - payments will be unavailable. Set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY.");
  }

  // Referral routes
  app.get("/api/referrals/my-code", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      let stats = await storage.getReferralStats(userId);
      
      if (!stats.referralCode) {
        // Generate new referral code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        await storage.createReferral({
          referrerId: userId,
          referralCode: code,
          status: "pending",
          rewardAmount: 10000, // R100 in cents
          tier: "bronze",
        });
        stats = await storage.getReferralStats(userId);
      }
      
      res.json({ referralCode: stats.referralCode });
    } catch (error) {
      console.error("Error fetching referral code:", error);
      res.status(500).json({ message: "Failed to fetch referral code" });
    }
  });

  app.get("/api/referrals/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const stats = await storage.getReferralStats(userId);
      const referrals = await storage.getReferralsByReferrer(userId);
      res.json({ ...stats, referrals });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  app.post("/api/referrals/claim/:code", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const code = req.params.code;
      
      const referral = await storage.getReferralByCode(code);
      if (!referral) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
      
      if (referral.referrerId === userId) {
        return res.status(400).json({ message: "You cannot refer yourself" });
      }

      if (referral.status !== "pending") {
        return res.status(400).json({ message: "Referral code already claimed or invalid" });
      }
      
      await storage.updateReferralStatus(referral.id, "signup", userId);
      res.json({ message: "Referral code claimed successfully" });
    } catch (error) {
      console.error("Error claiming referral code:", error);
      res.status(500).json({ message: "Failed to claim referral code" });
    }
  });

  // ============ FORTIFY ROUTES (#41-#60) ============
  const fortify = await import("./fortify");

  // #41 — Escrow webhook handler (PayFast → release funds on completion)
  // Enhanced in server/payfast.ts; escrow creation endpoint:
  app.post("/api/escrow/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { bookingId, amount, freelancerId, payfastPaymentId } = req.body;
      if (!bookingId || !amount || !freelancerId) {
        return res.status(400).json({ message: "bookingId, amount, and freelancerId are required" });
      }
      const tx = await storage.createEscrowTransaction({
        bookingId,
        clientId: userId,
        freelancerId,
        amount,
        payfastPaymentId: payfastPaymentId || null,
        status: "held",
      });
      fortify.trackMetric("escrowHeld", amount);
      res.status(201).json(tx);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create escrow", error: error.message });
    }
  });

  app.get("/api/escrow/booking/:bookingId", isAuthenticated, async (req: any, res) => {
    try {
      const tx = await storage.getEscrowByBooking(req.params.bookingId);
      if (!tx) return res.status(404).json({ message: "No escrow found for this booking" });
      res.json(tx);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch escrow" });
    }
  });

  app.get("/api/escrow/stats", isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getEscrowStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch escrow stats" });
    }
  });

  // #43 — Cache management endpoints
  app.get("/api/cache/stats", isAuthenticated, async (req: any, res) => {
    res.json(fortify.cache.stats());
  });

  app.delete("/api/cache/invalidate", isAuthenticated, async (req: any, res) => {
    const { pattern } = req.body;
    const count = fortify.cache.invalidate(pattern || "");
    res.json({ invalidated: count });
  });

  // Cached job listings (#43)
  app.get("/api/cached/jobs", async (_req, res) => {
    try {
      const cacheKey = "jobs:all";
      const cached = fortify.cache.get<any[]>(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(cached);
      }

      const allJobs = await storage.getAllJobs();
      fortify.cache.set(cacheKey, allJobs, 300);
      res.setHeader("X-Cache", "MISS");
      res.json(allJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cached jobs" });
    }
  });

  // Cached freelancer profiles (#43)
  app.get("/api/cached/freelancers", async (req, res) => {
    try {
      const { query, location } = req.query;
      const cacheKey = `freelancers:${query || "all"}:${location || "all"}`;
      const cached = fortify.cache.get<any[]>(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(cached);
      }

      const profiles = await storage.searchFreelancers(query as string, location as string);
      fortify.cache.set(cacheKey, profiles, 300);
      res.setHeader("X-Cache", "MISS");
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cached freelancers" });
    }
  });

  // #44 — Audit log endpoints
  app.get("/api/admin/audit-logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      if (userId !== "user_2Pz69BfA5yS3R8M") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { action, resource, limit } = req.query;
      const logs = await storage.getAuditLogs({
        action: action as string,
        resource: resource as string,
        limit: limit ? parseInt(limit as string) : 100,
      });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/audit-logs/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const logs = await storage.getAuditLogs({ userId, limit: 50 });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your audit logs" });
    }
  });

  // #45 — Premium tier endpoints
  app.get("/api/premium/tier", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const tier = await storage.getPremiumTier(userId);
      res.json(tier || { tier: "free", visibilityBoost: 0, rateLimitMultiplier: 1 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch premium tier" });
    }
  });

  app.post("/api/premium/upgrade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { tier, payfastSubscriptionId } = req.body;
      if (!["free", "premium", "enterprise"].includes(tier)) {
        return res.status(400).json({ message: "Invalid tier. Must be free, premium, or enterprise" });
      }
      const boosts: Record<string, number> = { free: 0, premium: 25, enterprise: 50 };
      const multipliers: Record<string, number> = { free: 1, premium: 5, enterprise: 10 };
      const result = await storage.upsertPremiumTier({
        userId,
        tier,
        visibilityBoost: boosts[tier],
        rateLimitMultiplier: multipliers[tier],
        payfastSubscriptionId: payfastSubscriptionId || null,
        featuredUntil: tier !== "free" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to upgrade tier" });
    }
  });

  app.get("/api/premium/top/:category", async (req, res) => {
    try {
      const top = await fortify.getTopPremiumInCategory(req.params.category);
      res.json(top);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch premium listings" });
    }
  });

  // #46 — Enterprise bulk post (CSV upload → create 50 jobs)
  app.post("/api/jobs/bulk-upload", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { csv } = req.body;
      if (!csv) return res.status(400).json({ message: "CSV content required in 'csv' field" });

      const parsedJobs = fortify.parseCSVToJobs(csv, userId);
      if (parsedJobs.length === 0) return res.status(400).json({ message: "No valid jobs found in CSV" });

      const created = [];
      const errors: string[] = [];
      for (const job of parsedJobs) {
        try {
          const newJob = await storage.createJob(job);
          created.push(newJob);
          fortify.trackMetric("jobsCreated");
        } catch (err: any) {
          errors.push(`Row "${job.title}": ${err.message}`);
        }
      }

      fortify.cache.invalidate("jobs:");

      await storage.createAuditLog({
        userId,
        action: "bulk_job_upload",
        resource: "jobs",
        metadata: { totalParsed: parsedJobs.length, created: created.length, errors: errors.length },
      });

      res.status(201).json({
        message: `${created.length} jobs created, ${errors.length} errors`,
        created: created.length,
        errors,
        jobs: created,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to process CSV" });
    }
  });

  // #47 — Referral payout calculation (R100 per successful referral)
  app.get("/api/referrals/payout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const payout = await fortify.calculateReferralPayout(userId);
      res.json(payout);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate referral payout" });
    }
  });

  // #48 — Job completion confirmation flow
  app.post("/api/bookings/:id/confirm-completion", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const result = await fortify.processJobCompletion(req.params.id, userId);
      fortify.trackMetric("escrowReleased", result.amount);
      fortify.cache.invalidate("jobs:");
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to confirm completion" });
    }
  });

  // #49 — Dispute resolution stub
  app.post("/api/disputes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { bookingId, respondentId, reason, description } = req.body;
      if (!bookingId || !respondentId || !reason || !description) {
        return res.status(400).json({ message: "bookingId, respondentId, reason, and description required" });
      }
      const dispute = await fortify.createDispute({
        bookingId, initiatorId: userId, respondentId, reason, description,
      });
      res.status(201).json(dispute);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create dispute" });
    }
  });

  app.get("/api/disputes/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const disputes = await storage.getDisputesByUser(userId);
      res.json(disputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.get("/api/admin/disputes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      if (userId !== "user_2Pz69BfA5yS3R8M") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const status = req.query.status as string | undefined;
      const allDisputes = await storage.getAllDisputes(status);
      res.json(allDisputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.patch("/api/admin/disputes/:id/resolve", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      if (userId !== "user_2Pz69BfA5yS3R8M") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { resolution } = req.body;
      if (!resolution) return res.status(400).json({ message: "resolution required" });
      const dispute = await storage.resolveDispute(parseInt(req.params.id), userId, resolution);
      if (!dispute) return res.status(404).json({ message: "Dispute not found" });
      res.json(dispute);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve dispute" });
    }
  });

  app.get("/api/disputes/:id/chat-export", isAuthenticated, async (req: any, res) => {
    try {
      const dispute = await storage.getDispute(parseInt(req.params.id));
      if (!dispute) return res.status(404).json({ message: "Dispute not found" });
      const userId = (req.session as any).userId;
      if (dispute.initiatorId !== userId && dispute.respondentId !== userId && userId !== "user_2Pz69BfA5yS3R8M") {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json({
        disputeId: dispute.id,
        bookingId: dispute.bookingId,
        chatLog: dispute.chatLogExport || [],
        exportedAt: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export chat log" });
    }
  });

  // #52 — Public stats endpoint for impact dashboard
  app.get("/api/stats/public", async (_req, res) => {
    try {
      const cacheKey = "stats:public";
      const cached = fortify.cache.get<any>(cacheKey);
      if (cached) return res.json(cached);

      const stats = await storage.getGlobalStats();
      const escrowStats = await storage.getEscrowStats();
      const invitationStats = await storage.getBusinessInvitationStats();

      const result = {
        platform: "FreelanceSkills.net",
        country: "South Africa",
        stats: {
          totalJobs: stats.jobs,
          totalFreelancers: stats.profiles,
          totalBookings: stats.bookings,
          totalMessages: stats.messages,
          escrowProtected: escrowStats.held + escrowStats.released,
          escrowReleased: escrowStats.released,
          businessesInvited: invitationStats.total,
          businessesClaimed: invitationStats.claimed,
        },
        updatedAt: new Date().toISOString(),
      };

      fortify.cache.set(cacheKey, result, 300);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public stats" });
    }
  });

  // #54 — Manual cron trigger (admin only)
  app.post("/api/admin/cron/purge-expired", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      if (userId !== "user_2Pz69BfA5yS3R8M") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const result = await fortify.cronPurgeExpiredJobs();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to run cron" });
    }
  });

  // #55 — Manual fraud detection trigger (admin only)
  app.post("/api/admin/cron/fraud-detection", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      if (userId !== "user_2Pz69BfA5yS3R8M") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const result = await fortify.cronFraudDetection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to run fraud detection" });
    }
  });

  // #56 — SEO meta tags generator
  app.get("/api/seo/job/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found" });
      res.json(fortify.generateSEOMetaTags("job", job));
    } catch (error) {
      res.status(500).json({ message: "Failed to generate SEO tags" });
    }
  });

  app.get("/api/seo/category/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      const packages = await storage.getAllPackages(slug);
      res.json(fortify.generateSEOMetaTags("category", {
        name, slug, location: "South Africa", count: packages.length,
      }));
    } catch (error) {
      res.status(500).json({ message: "Failed to generate SEO tags" });
    }
  });

  app.get("/api/seo/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      res.json(fortify.generateSEOMetaTags("profile", profile));
    } catch (error) {
      res.status(500).json({ message: "Failed to generate SEO tags" });
    }
  });

  // #59 — Backup cron stub
  app.post("/api/admin/cron/backup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      if (userId !== "user_2Pz69BfA5yS3R8M") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const result = await fortify.cronBackupStub();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to run backup" });
    }
  });

  // #60 — Prometheus metrics + Grafana dashboard stub
  app.get("/api/metrics/prometheus", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(fortify.prometheusTextFormat());
  });

  app.get("/api/metrics/dashboard", async (_req, res) => {
    try {
      const metrics = fortify.getPrometheusMetrics();
      const stats = await storage.getGlobalStats();
      const escrowStats = await storage.getEscrowStats();

      res.json({
        system: {
          uptime: metrics.uptime,
          memory: metrics.memory,
          cpu: metrics.cpuUsage,
        },
        http: {
          totalRequests: metrics.httpRequestsTotal,
          latency: metrics.latency,
          errorsTotal: metrics.errorsTotal,
        },
        business: {
          ...stats,
          escrow: escrowStats,
          fraudFlags: metrics.fraudFlagsCreated,
          jobsCreated: metrics.jobsCreated,
          bookingsCreated: metrics.bookingsCreated,
        },
        cache: fortify.cache.stats(),
        timestamp: metrics.timestamp,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // ============ AI ENGINE V2 ROUTES (#21-#40) ============
  const aiEngine = await import("./ai-engine");

  // #21 Enhanced task-chat with conversation memory
  app.post("/api/ai/task-chat-v2", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const sid = sessionId || (req.session as any)?.userId || `anon-${Date.now()}`;
      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";
      if (!apiKey) return res.status(500).json({ message: "AI API key not configured" });

      aiEngine.storeConversation(sid, "user", message);
      const history = aiEngine.getConversationHistory(sid);

      const systemPrompt = `You are the FreelanceSkills AI Task Assistant v2 with memory. You remember the conversation context.
FreelanceSkills is a South African freelance marketplace.

Budget Estimation Rules (SA Market Rates):
- General Labor/Cleaning: R150 - R300/hr
- Skilled Trades (Plumbing/Electrical): R400 - R800/hr call-out + labor
- Professional Services (Design/Writing): R300 - R1000/hr
- Specialized Tech/Consulting: R800 - R2500+/hr

You can:
1. Analyze tasks and suggest budgets
2. Identify skill gaps in requirements
3. Predict realistic rate ranges when clients mention budgets
4. Suggest improvements to job descriptions
5. Flag when a task needs multiple specialists

Be professional, helpful, concise. Use South African English and Rand (R).`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...history,
      ];

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.7 }),
      });
      if (!response.ok) throw new Error("AI API error");
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      aiEngine.storeConversation(sid, "assistant", aiResponse);

      res.json({ message: aiResponse, sessionId: sid, memoryLength: history.length });
    } catch (error) {
      console.error("Error in task-chat-v2:", error);
      res.status(500).json({ message: "I'm having trouble processing your request." });
    }
  });

  app.delete("/api/ai/conversation/:sessionId", (req, res) => {
    aiEngine.clearConversation(req.params.sessionId);
    res.json({ cleared: true });
  });

  // #22 Budget prediction
  app.post("/api/ai/predict-budget", async (req, res) => {
    try {
      const { clientStatement, category } = req.body;
      if (!clientStatement) return res.status(400).json({ message: "clientStatement is required" });
      const prediction = await aiEngine.predictBudget(clientStatement, category);
      res.json(prediction);
    } catch (error) {
      console.error("Error predicting budget:", error);
      res.status(500).json({ message: "Failed to predict budget" });
    }
  });

  // #23 Skill-gap analysis
  app.post("/api/ai/skill-gap", async (req, res) => {
    try {
      const { jobSkills, freelancerSkills } = req.body;
      if (!jobSkills || !freelancerSkills) return res.status(400).json({ message: "jobSkills and freelancerSkills arrays required" });
      const analysis = await aiEngine.analyzeSkillGaps(jobSkills, freelancerSkills);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing skill gaps:", error);
      res.status(500).json({ message: "Failed to analyze skill gaps" });
    }
  });

  // #24 Application fraud/risk scoring
  app.post("/api/ai/application-risk", isAuthenticated, async (req: any, res) => {
    try {
      const { jobId, profileData } = req.body;
      const userId = (req.session as any).userId;
      const risk = await aiEngine.scoreApplicationRisk(userId, jobId, profileData);
      res.json(risk);
    } catch (error) {
      console.error("Error scoring application risk:", error);
      res.status(500).json({ message: "Failed to score risk" });
    }
  });

  // #25 Predictive job success score
  app.post("/api/ai/predict-success", isAuthenticated, async (req: any, res) => {
    try {
      const { freelancerId, jobId } = req.body;
      if (!freelancerId) return res.status(400).json({ message: "freelancerId required" });
      const prediction = await aiEngine.predictJobSuccess(freelancerId, jobId);
      res.json(prediction);
    } catch (error) {
      console.error("Error predicting success:", error);
      res.status(500).json({ message: "Failed to predict success" });
    }
  });

  // #26 Auto-suggest job post improvements
  app.post("/api/ai/improve-listing", async (req, res) => {
    try {
      const job = req.body;
      const suggestions = await aiEngine.suggestJobPostImprovements(job);
      res.json(suggestions);
    } catch (error) {
      console.error("Error suggesting improvements:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  // #27 Location-aware matching
  app.post("/api/ai/location-boost", (req, res) => {
    const { jobLocation, freelancerLocation } = req.body;
    if (!jobLocation || !freelancerLocation) return res.status(400).json({ message: "Both locations required" });
    res.json(aiEngine.locationBoost(jobLocation, freelancerLocation));
  });

  // #28 Urgency escalation
  app.post("/api/ai/urgency-check", (req, res) => {
    const { jobCreatedAt, applicationCount } = req.body;
    if (!jobCreatedAt) return res.status(400).json({ message: "jobCreatedAt required" });
    res.json(aiEngine.urgencyEscalation(jobCreatedAt, applicationCount || 0));
  });

  // #29 Reputation modifier
  app.get("/api/ai/reputation/:freelancerId", async (req, res) => {
    try {
      const result = await aiEngine.getReputationModifier(req.params.freelancerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reputation modifier" });
    }
  });

  // #30 Referral trust boost
  app.get("/api/ai/referral-trust/:freelancerId", async (req, res) => {
    try {
      const result = await aiEngine.getReferralTrustBoost(req.params.freelancerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to get referral trust boost" });
    }
  });

  // #31 Course completion boost
  app.get("/api/ai/course-boost/:freelancerId", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const result = await aiEngine.getCourseCompletionBoost(req.params.freelancerId, category);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to get course boost" });
    }
  });

  // #32 Availability check
  app.get("/api/ai/availability/:freelancerId", (req, res) => {
    res.json(aiEngine.checkAvailability(req.params.freelancerId));
  });

  app.post("/api/ai/availability", isAuthenticated, (req: any, res) => {
    const userId = (req.session as any).userId;
    aiEngine.setAvailability(userId, req.body);
    res.json({ updated: true });
  });

  // #33 Multi-skill weighting
  app.post("/api/ai/skill-weight-match", (req, res) => {
    const { requiredSkills, freelancerSkills } = req.body;
    if (!requiredSkills || !freelancerSkills) return res.status(400).json({ message: "requiredSkills and freelancerSkills required" });
    res.json(aiEngine.multiSkillMatch(requiredSkills, freelancerSkills));
  });

  // #34 Client satisfaction prediction
  app.post("/api/ai/predict-satisfaction", isAuthenticated, async (req: any, res) => {
    try {
      const { clientId, freelancerId } = req.body;
      if (!clientId || !freelancerId) return res.status(400).json({ message: "clientId and freelancerId required" });
      const result = await aiEngine.predictClientSatisfaction(clientId, freelancerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to predict satisfaction" });
    }
  });

  // #35 Auto-reply templates
  app.post("/api/ai/auto-reply-templates", (req, res) => {
    const { freelancerName, hourlyRate, skills } = req.body;
    res.json(aiEngine.generateAutoReplyTemplates(freelancerName || "Freelancer", hourlyRate || 0, skills || []));
  });

  // #36 Voice-to-text stub
  app.get("/api/ai/voice-to-text", (_req, res) => {
    res.json(aiEngine.voiceToTextStub());
  });

  // #37 Image recognition stub
  app.post("/api/ai/image-recognition", (req, res) => {
    const { imageDescription } = req.body;
    res.json(aiEngine.imageRecognitionStub(imageDescription));
  });

  // #38 Review sentiment analysis
  app.post("/api/ai/review-sentiment", async (req, res) => {
    try {
      const { reviews } = req.body;
      if (!reviews || !Array.isArray(reviews)) return res.status(400).json({ message: "reviews array required" });
      const result = await aiEngine.analyzeReviewSentiment(reviews);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  // #39 Dynamic pricing
  app.post("/api/ai/dynamic-pricing", async (req, res) => {
    try {
      const { category, currentRate, location } = req.body;
      if (!category) return res.status(400).json({ message: "category required" });
      const result = await aiEngine.suggestDynamicPricing(category, currentRate || 0, location || "");
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to suggest pricing" });
    }
  });

  // #40 Blockchain credential mock + green impact badge
  app.post("/api/ai/blockchain-credential", isAuthenticated, (req: any, res) => {
    const userId = (req.session as any).userId;
    const { type, issuer, date } = req.body;
    res.json(aiEngine.blockchainCredentialMock(userId, { type: type || "Professional Certificate", issuer: issuer || "FreelanceSkills Academy", date: date || new Date().toISOString() }));
  });

  app.get("/api/ai/green-impact/:freelancerId", (req, res) => {
    res.json(aiEngine.greenImpactBadge(req.params.freelancerId));
  });

  // Enhanced matching engine (combines #27, #29, #30, #31, #33)
  app.post("/api/ai/enhanced-match", isAuthenticated, async (req: any, res) => {
    try {
      const { job, freelancerId } = req.body;
      if (!job || !freelancerId) return res.status(400).json({ message: "job and freelancerId required" });

      const profile = await storage.getProfile(freelancerId);
      if (!profile) return res.status(404).json({ message: "Freelancer not found" });

      const result = await aiEngine.enhancedMatch(
        { ...job, skills: job.skills || [], location: job.location || "" },
        {
          id: freelancerId,
          skills: profile.skills || [],
          location: profile.location || "",
          hourlyRate: profile.hourlyRate || 0,
          rating: profile.rating || 0,
          completedJobs: profile.completedJobs || 0,
          isPro: profile.isPro || false,
        }
      );
      res.json(result);
    } catch (error) {
      console.error("Error in enhanced match:", error);
      res.status(500).json({ message: "Failed to compute enhanced match" });
    }
  });

  // Batch enhanced matching — match job against all freelancers
  app.post("/api/ai/enhanced-match-all", isAuthenticated, async (req: any, res) => {
    try {
      const { job } = req.body;
      if (!job) return res.status(400).json({ message: "job object required" });

      const freelancers = await storage.searchFreelancers(job.category, job.location);
      const matches = await Promise.all(
        freelancers.slice(0, 20).map(async (f) => {
          const result = await aiEngine.enhancedMatch(
            { ...job, skills: job.skills || [], location: job.location || "" },
            {
              id: f.userId,
              skills: f.skills || [],
              location: f.location || "",
              hourlyRate: f.hourlyRate || 0,
              rating: f.rating || 0,
              completedJobs: f.completedJobs || 0,
              isPro: f.isPro || false,
            }
          );
          return { freelancer: { id: f.userId, title: f.title, location: f.location, rating: f.rating, isPro: f.isPro, skills: f.skills }, ...result };
        })
      );

      const ranked = matches.sort((a, b) => b.totalScore - a.totalScore);
      res.json({
        matches: ranked,
        summary: {
          total: ranked.length,
          topScore: ranked[0]?.totalScore || 0,
          avgScore: ranked.length > 0 ? Math.round(ranked.reduce((s, m) => s + m.totalScore, 0) / ranked.length) : 0,
        },
      });
    } catch (error) {
      console.error("Error in enhanced match all:", error);
      res.status(500).json({ message: "Failed to compute matches" });
    }
  });

  return httpServer;
}
