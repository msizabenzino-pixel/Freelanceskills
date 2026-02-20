import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication FIRST
  await setupAuth(app);
  registerAuthRoutes(app);
  const { isAuthenticated } = await import("./replit_integrations/auth");
  const { insertJobSchema, insertProfileSchema, insertServicePackageSchema, insertBookingSchema, insertReviewSchema, insertMessageSchema } = await import("@shared/schema");
  const { checkMessageSafety, SAFETY_DISCLAIMERS, REPORT_REASONS } = await import("@shared/safety");

  // Job routes
  app.get("/api/jobs", async (_req, res) => {
    try {
      const allJobs = await storage.getAllJobs();
      res.json(allJobs);
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const profile = await storage.updateProfile(userId, req.body);
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBookingSchema.parse(req.body);
      
      const booking = await storage.createBooking({
        ...validatedData,
        clientId: userId,
      });
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const freelancerId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
  
  app.post("/api/ai/match-taskers", async (req, res) => {
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
  app.post("/api/ai/generate-description", async (req, res) => {
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
  app.post("/api/ai/estimate-budget", async (req, res) => {
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
  
  app.post("/api/ai/analyze-task", async (req, res) => {
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
  
  app.post("/api/ai/match-packages", async (req, res) => {
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

  return httpServer;
}
