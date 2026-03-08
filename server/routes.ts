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
              avatar: otherProfile?.avatarUrl,
              role: otherProfile?.category || "Professional",
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

  const { createPaymentIntent, getPaymentStatus, getStripePublishableKey, handleWebhook, isStripeConfigured } = await import("./stripe");

  app.get("/api/stripe/config", getStripePublishableKey);

  app.post("/api/stripe/create-payment-intent", async (req, res) => {
    await createPaymentIntent(req, res);
  });

  app.get("/api/stripe/payment/:paymentIntentId", async (req, res) => {
    await getPaymentStatus(req, res);
  });

  app.post("/api/stripe/webhook", async (req, res) => {
    await handleWebhook(req, res);
  });

  if (isStripeConfigured()) {
    console.log("Stripe payment routes registered (including webhook)");
  } else {
    console.log("Stripe credentials not configured - payments will be unavailable");
  }

  return httpServer;
}
