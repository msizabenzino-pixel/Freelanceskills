import type { Express } from "express";
import { db } from "./db";
import { eq, desc, sql, and, count } from "drizzle-orm";
import {
  blockchainCredentials, nftBadges, greenImpactScores,
  communityForumPosts, communityForumReplies,
  daoProposals, daoVotes, aiContracts,
  wellnessLogs, mentorMatches,
  profiles, jobs, reviews, bookings, certificates
} from "@shared/schema";
import crypto from "crypto";

function mockHash(input: string): string {
  return crypto.createHash("sha256").update(input + Date.now()).digest("hex");
}

function mockTxHash(): string {
  return "0x" + crypto.randomBytes(32).toString("hex");
}

function mockTokenId(): string {
  return "FSK-" + Math.floor(Math.random() * 1000000).toString().padStart(7, "0");
}

const SA_CITIES: Record<string, { lat: number; lng: number }> = {
  "cape town": { lat: -33.9249, lng: 18.4241 },
  "johannesburg": { lat: -26.2041, lng: 28.0473 },
  "durban": { lat: -29.8587, lng: 31.0218 },
  "pretoria": { lat: -25.7461, lng: 28.1881 },
  "port elizabeth": { lat: -33.918, lng: 25.5701 },
  "bloemfontein": { lat: -29.0852, lng: 26.1596 },
  "stellenbosch": { lat: -33.9321, lng: 18.8602 },
  "sandton": { lat: -26.1076, lng: 28.0567 },
  "remote": { lat: 0, lng: 0 },
};

function calcDistance(city1: string, city2: string): number {
  const c1 = SA_CITIES[city1.toLowerCase()] || SA_CITIES["remote"];
  const c2 = SA_CITIES[city2.toLowerCase()] || SA_CITIES["remote"];
  if (!c1.lat || !c2.lat) return 0;
  const R = 6371;
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLng = (c2.lng - c1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CARBON_PER_KM = 0.21;

export function registerVisionRoutes(app: Express, isAuthenticated: any) {

  // ================================================================
  // D1 — BLOCKCHAIN CREDENTIAL VERIFICATION (SELF-SOVEREIGN ID MOCK)
  // ================================================================
  app.post("/api/vision/blockchain/verify", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { credentialType, issuer, documentData } = req.body;
      if (!credentialType || !issuer) return res.status(400).json({ message: "credentialType and issuer required" });

      const hash = mockHash(`${userId}-${credentialType}-${issuer}-${documentData || ""}`);
      const [cred] = await db.insert(blockchainCredentials).values({
        userId, credentialType, issuer, hash,
        status: "verified",
        metadata: { verifiedAt: new Date().toISOString(), method: "self-sovereign-id-v1", chain: "polygon-amoy-testnet", documentHash: hash.substring(0, 16) },
      }).returning();

      res.json({
        credentialId: cred.id, hash: cred.hash, status: "verified",
        blockchain: { network: "Polygon Amoy (Testnet)", contract: "0x7F5c...FreelanceSkillsSSI", txHash: mockTxHash() },
        message: "Credential verified and anchored to blockchain (mock)",
      });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/vision/blockchain/credentials/:userId", async (req, res) => {
    const creds = await db.select().from(blockchainCredentials).where(eq(blockchainCredentials.userId, req.params.userId)).orderBy(desc(blockchainCredentials.createdAt));
    res.json(creds);
  });

  // ================================================================
  // D2 — NFT BADGE/CERTIFICATION FOR COURSES
  // ================================================================
  app.post("/api/vision/nft/mint-badge", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { courseId, courseName, badgeName } = req.body;
      if (!badgeName) return res.status(400).json({ message: "badgeName required" });

      const tokenId = mockTokenId();
      const txHash = mockTxHash();
      const [badge] = await db.insert(nftBadges).values({
        userId, tokenId, txHash, badgeName,
        contractAddress: "0xFSK...NFTBadges",
        imageUrl: `https://freelanceskills.net/nft/${tokenId}.png`,
        metadata: { courseId, courseName, mintedBy: "FreelanceSkills Academy", standard: "ERC-721", chain: "Polygon" },
      }).returning();

      res.json({
        tokenId: badge.tokenId, txHash: badge.txHash, badgeName: badge.badgeName,
        imageUrl: badge.imageUrl,
        opensea: `https://testnets.opensea.io/assets/amoy/${badge.contractAddress}/${badge.tokenId}`,
        message: "NFT badge minted successfully (mock)",
      });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/vision/nft/badges/:userId", async (req, res) => {
    const badges_ = await db.select().from(nftBadges).where(eq(nftBadges.userId, req.params.userId)).orderBy(desc(nftBadges.mintedAt));
    res.json(badges_);
  });

  // ================================================================
  // D3 — GREEN IMPACT SCORING (CARBON FOOTPRINT)
  // ================================================================
  app.post("/api/vision/green/calculate", async (req, res) => {
    const { freelancerLocation, clientLocation, isRemote } = req.body;
    if (!freelancerLocation) return res.status(400).json({ message: "freelancerLocation required" });

    const distance = isRemote ? 0 : calcDistance(freelancerLocation, clientLocation || "remote");
    const carbonKg = Math.round(distance * CARBON_PER_KM * 100) / 100;
    const treesNeeded = Math.max(1, Math.ceil(carbonKg / 22));

    res.json({
      distance: Math.round(distance), unit: "km",
      carbonKg, rating: carbonKg === 0 ? "A+" : carbonKg < 10 ? "A" : carbonKg < 50 ? "B" : carbonKg < 100 ? "C" : "D",
      isRemote: isRemote || distance === 0,
      offsetCost: Math.round(carbonKg * 0.5 * 100),
      treesNeeded,
      recommendation: isRemote ? "Remote work = zero carbon footprint! 🌱" : `This job produces ~${carbonKg}kg CO₂. Consider offsetting for R${(carbonKg * 0.5).toFixed(0)}.`,
    });
  });

  app.get("/api/vision/green/score/:userId", async (req, res) => {
    const scores = await db.select().from(greenImpactScores).where(eq(greenImpactScores.userId, req.params.userId));
    const totalCarbon = scores.reduce((sum, s) => sum + s.carbonKgs, 0);
    const remoteJobs = scores.filter(s => s.carbonKgs === 0).length;
    res.json({
      userId: req.params.userId, totalJobs: scores.length, totalCarbonKg: Math.round(totalCarbon * 100) / 100,
      remoteJobPercentage: scores.length > 0 ? Math.round((remoteJobs / scores.length) * 100) : 100,
      greenRating: totalCarbon < 50 ? "Eco Champion 🌿" : totalCarbon < 200 ? "Green Contributor 🌱" : "Offset Needed 🍂",
      treesPlanted: Math.floor(totalCarbon / 22),
    });
  });

  // ================================================================
  // D4 — CARBON OFFSET PARTNERSHIP (R5 DONATION → TREE)
  // ================================================================
  app.post("/api/vision/green/offset", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { jobId, amountCents } = req.body;
      const donation = amountCents || 500;
      const treesPlanted = Math.max(1, Math.floor(donation / 500));

      const [record] = await db.insert(greenImpactScores).values({
        userId, jobId: jobId || null, carbonKgs: 0, impactType: "offset",
        description: `Donated R${(donation / 100).toFixed(2)} → ${treesPlanted} tree(s) planted via Greenpop SA`,
      }).returning();

      res.json({
        offsetId: record.id, donation: { amount: donation, currency: "ZAR", display: `R${(donation / 100).toFixed(2)}` },
        impact: { treesPlanted, co2Offset: `${treesPlanted * 22}kg`, partner: "Greenpop South Africa", certificate: `https://freelanceskills.net/green-cert/${record.id}` },
        message: `Thank you! ${treesPlanted} tree(s) will be planted in your name 🌳`,
      });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/vision/green/offsets", async (_req, res) => {
    const offsets = await db.select().from(greenImpactScores).where(eq(greenImpactScores.impactType, "offset")).orderBy(desc(greenImpactScores.createdAt)).limit(50);
    const totalTrees = offsets.length;
    res.json({ totalOffsets: offsets.length, totalTreesPlanted: totalTrees, offsets });
  });

  // ================================================================
  // D5 — AI VIDEO INTERVIEW SCREENING STUB
  // ================================================================
  app.post("/api/vision/ai/video-interview", isAuthenticated, async (req: any, res) => {
    const { videoUrl, jobCategory } = req.body;
    if (!videoUrl) return res.status(400).json({ message: "videoUrl required" });

    const sentimentScore = Math.round((70 + Math.random() * 25) * 10) / 10;
    const skillScore = Math.round((60 + Math.random() * 35) * 10) / 10;
    const confidenceScore = Math.round((65 + Math.random() * 30) * 10) / 10;

    res.json({
      videoUrl, analysisId: `VIA-${Date.now()}`,
      scores: {
        sentiment: { score: sentimentScore, label: sentimentScore > 80 ? "Very Positive" : sentimentScore > 60 ? "Positive" : "Neutral" },
        technicalSkill: { score: skillScore, label: skillScore > 80 ? "Expert" : skillScore > 60 ? "Proficient" : "Developing" },
        confidence: { score: confidenceScore, label: confidenceScore > 80 ? "High" : confidenceScore > 60 ? "Moderate" : "Building" },
        communication: { score: Math.round((sentimentScore + confidenceScore) / 2 * 10) / 10, label: "Clear & Professional" },
      },
      overallScore: Math.round((sentimentScore + skillScore + confidenceScore) / 3 * 10) / 10,
      recommendations: [
        "Strong communication skills detected",
        jobCategory ? `Good fit for ${jobCategory} roles based on technical vocabulary` : "Consider specifying a job category for more precise analysis",
        "Tip: Maintain eye contact with the camera for higher engagement scores",
      ],
      disclaimer: "AI video analysis is a beta feature. Results are indicative and should not be the sole basis for hiring decisions.",
    });
  });

  // ================================================================
  // D6 — VOICE AI ASSISTANT FOR JOB POSTING
  // ================================================================
  app.post("/api/vision/ai/voice-job-post", async (req, res) => {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ message: "transcript required" });

    const lower = transcript.toLowerCase();
    const categoryMap: Record<string, string[]> = {
      "web-development": ["web dev", "web development", "web developer", "website", "frontend", "backend", "fullstack", "react", "node"],
      "design": ["design", "designer", "graphic", "ui/ux", "logo", "branding"],
      "writing": ["writing", "writer", "copywriting", "content", "blog", "article"],
      "plumbing": ["plumbing", "plumber", "pipe", "geyser", "drain"],
      "electrical": ["electrical", "electrician", "wiring", "circuit"],
      "tutoring": ["tutor", "tutoring", "teaching", "lesson", "math", "science"],
      "photography": ["photo", "photography", "photographer", "shoot", "videography"],
      "marketing": ["marketing", "seo", "social media", "advertising", "campaign"],
    };
    let detectedCategory = "general";
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(k => lower.includes(k))) { detectedCategory = cat; break; }
    }

    const urgentWords = ["urgent", "asap", "immediately", "rush", "today"];
    const isUrgent = urgentWords.some(w => lower.includes(w));

    const budgetMatch = lower.match(/r?\s?(\d[\d,]*)/);
    const detectedBudget = budgetMatch ? parseInt(budgetMatch[1].replace(",", "")) * 100 : 50000;

    const locationMatch = lower.match(/(?:in|at|near)\s+(\w+(?:\s+\w+)?)/i);
    const detectedLocation = locationMatch ? locationMatch[1] : "Remote";

    res.json({
      originalTranscript: transcript,
      structuredJob: {
        title: transcript.length > 60 ? transcript.substring(0, 57) + "..." : transcript,
        description: `Job request: ${transcript}\n\nThis listing was created from a voice description using FreelanceSkills AI.`,
        category: detectedCategory,
        budget: detectedBudget,
        currency: "ZAR",
        location: detectedLocation,
        isUrgent,
        suggestedSkills: detectedCategory === "web-development" ? ["React", "TypeScript", "Node.js"] :
          detectedCategory === "design" ? ["Figma", "UI/UX", "Branding"] :
          detectedCategory === "plumbing" ? ["Plumbing", "Maintenance", "Repair"] : ["Freelancing"],
      },
      confidence: 0.82,
      message: "Job post generated from your voice input. Please review and edit before publishing.",
    });
  });

  // ================================================================
  // D7 — AR PORTFOLIO PREVIEW (3D MODEL STUB)
  // ================================================================
  app.post("/api/vision/ar/portfolio-preview", async (req, res) => {
    const { photoUrl, projectType } = req.body;
    if (!photoUrl) return res.status(400).json({ message: "photoUrl required" });

    res.json({
      photoUrl, modelId: `AR-${Date.now()}`,
      arPreview: {
        modelUrl: `https://freelanceskills.net/ar/models/${Date.now()}.glb`,
        thumbnailUrl: `https://freelanceskills.net/ar/thumbs/${Date.now()}.jpg`,
        format: "glTF 2.0 / GLB",
        dimensions: { width: 1920, height: 1080, depth: 100 },
        polyCount: 12450,
        textureResolution: "4K",
      },
      viewerLinks: {
        webAR: `https://freelanceskills.net/ar/view/${Date.now()}`,
        ios: `https://freelanceskills.net/ar/ios/${Date.now()}.usdz`,
        android: `intent://freelanceskills.net/ar/view/${Date.now()}#Intent;scheme=https;package=com.google.ar.core;end`,
      },
      projectType: projectType || "general",
      message: "3D model generated from your portfolio photo (stub). AR preview available on supported devices.",
    });
  });

  // ================================================================
  // D8 — PREDICTIVE EARNINGS FORECAST (ML STUB)
  // ================================================================
  app.post("/api/vision/ai/earnings-forecast", async (req, res) => {
    const { monthlyIncome, hourlyRate, hoursPerWeek, category, yearsExperience } = req.body;

    const baseMonthly = monthlyIncome || (hourlyRate || 300) * (hoursPerWeek || 40) * 4.33;
    const exp = yearsExperience || 1;
    const growthRate = Math.min(0.15, 0.05 + exp * 0.01);

    const forecast = [];
    let cumulative = 0;
    for (let m = 1; m <= 12; m++) {
      const seasonality = 1 + 0.1 * Math.sin((m - 1) * Math.PI / 6);
      const projected = Math.round(baseMonthly * (1 + growthRate) ** (m / 12) * seasonality);
      cumulative += projected;
      forecast.push({ month: m, projected, cumulative, growth: `${(growthRate * 100 / 12 * m).toFixed(1)}%` });
    }

    const annualProjected = cumulative;
    res.json({
      currentMonthly: Math.round(baseMonthly), annualProjected,
      forecast,
      insights: {
        growthRate: `${(growthRate * 100).toFixed(1)}%`,
        bestMonth: forecast.reduce((a, b) => a.projected > b.projected ? a : b).month,
        milestones: [
          { target: 100000 * 100, label: "R100k/year", estimated: annualProjected >= 100000 * 100 ? "On track ✅" : `Need ${Math.round((100000 * 100 - annualProjected) / 12)} more/mo` },
          { target: 500000 * 100, label: "R500k/year", estimated: annualProjected >= 500000 * 100 ? "On track ✅" : "Keep growing 📈" },
        ],
      },
      recommendation: annualProjected > 300000 * 100
        ? `At this rate, you'll earn R${(annualProjected / 100).toLocaleString()} next year! Consider premium for extra visibility.`
        : `Projected: R${(annualProjected / 100).toLocaleString()}/year. Boost earnings by expanding your skills on the Academy.`,
      disclaimer: "Forecast is based on current trends and may vary. Past performance does not guarantee future earnings.",
    });
  });

  // ================================================================
  // D9 — COMMUNITY FORUM STUB
  // ================================================================
  const FORUM_CATEGORIES = [
    { id: "general", name: "General Discussion", icon: "💬", description: "Open forum for the community" },
    { id: "freelancing-tips", name: "Freelancing Tips", icon: "💡", description: "Share advice and best practices" },
    { id: "job-leads", name: "Job Leads", icon: "🎯", description: "Share and discover opportunities" },
    { id: "tech", name: "Technology", icon: "💻", description: "Dev tools, frameworks, and tech talk" },
    { id: "design", name: "Design & Creative", icon: "🎨", description: "Design, branding, and creative work" },
    { id: "finance", name: "Finance & Tax", icon: "💰", description: "Tax tips, invoicing, and financial advice for SA freelancers" },
    { id: "success-stories", name: "Success Stories", icon: "🏆", description: "Celebrate wins and inspire others" },
    { id: "feature-requests", name: "Feature Requests", icon: "🚀", description: "Suggest improvements to FreelanceSkills" },
  ];

  app.get("/api/vision/forum/categories", (_req, res) => res.json(FORUM_CATEGORIES));

  app.get("/api/vision/forum/posts", async (req, res) => {
    const category = req.query.category as string;
    const q = category
      ? db.select().from(communityForumPosts).where(eq(communityForumPosts.category, category)).orderBy(desc(communityForumPosts.createdAt)).limit(50)
      : db.select().from(communityForumPosts).orderBy(desc(communityForumPosts.createdAt)).limit(50);
    const posts = await q;
    res.json(posts);
  });

  app.post("/api/vision/forum/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { category, title, content } = req.body;
      if (!title || !content || !category) return res.status(400).json({ message: "category, title, and content required" });
      const [post] = await db.insert(communityForumPosts).values({ userId, category, title, content }).returning();
      res.json(post);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/vision/forum/posts/:id/reply", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const postId = parseInt(req.params.id);
      const { content } = req.body;
      if (!content) return res.status(400).json({ message: "content required" });
      const [reply] = await db.insert(communityForumReplies).values({ postId, userId, content }).returning();
      res.json(reply);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/vision/forum/posts/:id/replies", async (req, res) => {
    const postId = parseInt(req.params.id);
    const replies = await db.select().from(communityForumReplies).where(eq(communityForumReplies.postId, postId)).orderBy(communityForumReplies.createdAt);
    res.json(replies);
  });

  // ================================================================
  // D10 — DAO GOVERNANCE MOCK (PREMIUM USERS VOTE)
  // ================================================================
  app.get("/api/vision/dao/proposals", async (_req, res) => {
    const proposals = await db.select().from(daoProposals).orderBy(desc(daoProposals.createdAt)).limit(20);
    const withVotes = await Promise.all(proposals.map(async (p) => {
      const votes_ = await db.select().from(daoVotes).where(eq(daoVotes.proposalId, p.id));
      const yesVotes = votes_.filter(v => v.vote).reduce((s, v) => s + v.power, 0);
      const noVotes = votes_.filter(v => !v.vote).reduce((s, v) => s + v.power, 0);
      return { ...p, yesVotes, noVotes, totalVoters: votes_.length, quorumReached: votes_.length >= p.minVotesRequired };
    }));
    res.json(withVotes);
  });

  app.post("/api/vision/dao/proposals", isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = (req.session as any).userId;
      const { title, description, durationDays } = req.body;
      if (!title || !description) return res.status(400).json({ message: "title and description required" });
      const deadline = new Date(Date.now() + (durationDays || 7) * 86400000);
      const [proposal] = await db.insert(daoProposals).values({ creatorId, title, description, deadline }).returning();
      res.json({ ...proposal, message: "Governance proposal created. Premium members can now vote." });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/vision/dao/vote", isAuthenticated, async (req: any, res) => {
    try {
      const voterId = (req.session as any).userId;
      const { proposalId, vote } = req.body;
      if (proposalId === undefined || vote === undefined) return res.status(400).json({ message: "proposalId and vote required" });

      const existing = await db.select().from(daoVotes).where(and(eq(daoVotes.proposalId, proposalId), eq(daoVotes.voterId, voterId))).limit(1);
      if (existing.length > 0) return res.status(400).json({ message: "Already voted on this proposal" });

      const [v] = await db.insert(daoVotes).values({ proposalId, voterId, vote, power: 1 }).returning();
      res.json({ ...v, message: `Vote recorded: ${vote ? "Yes" : "No"}` });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ================================================================
  // D11 — CRYPTO PAYOUT STUB (USDC/ZAR STABLECOIN)
  // ================================================================
  app.get("/api/vision/crypto/rates", (_req, res) => {
    res.json({
      rates: [
        { pair: "ZAR/USDC", rate: 0.054, updated: new Date().toISOString() },
        { pair: "ZAR/USDT", rate: 0.054, updated: new Date().toISOString() },
        { pair: "ZAR/BTC", rate: 0.0000009, updated: new Date().toISOString() },
        { pair: "ZAR/ETH", rate: 0.000015, updated: new Date().toISOString() },
      ],
      supportedNetworks: ["Polygon", "Ethereum", "Solana", "Stellar"],
      disclaimer: "Rates are indicative. Actual rates at time of payout may differ.",
    });
  });

  app.post("/api/vision/crypto/payout", isAuthenticated, async (req: any, res) => {
    const { amountCents, currency, walletAddress, network } = req.body;
    if (!amountCents || !walletAddress) return res.status(400).json({ message: "amountCents and walletAddress required" });

    const crypto_ = currency || "USDC";
    const rate = crypto_ === "USDC" ? 0.054 : crypto_ === "USDT" ? 0.054 : 0.054;
    const cryptoAmount = (amountCents / 100 * rate).toFixed(6);

    res.json({
      payoutId: `CPAY-${Date.now()}`, status: "pending",
      fiat: { amount: amountCents, currency: "ZAR", display: `R${(amountCents / 100).toFixed(2)}` },
      crypto: { amount: cryptoAmount, currency: crypto_, network: network || "Polygon" },
      walletAddress, txHash: mockTxHash(),
      estimatedArrival: "2-5 minutes",
      fees: { networkFee: "~R5.00", platformFee: "0.5%", total: `R${(amountCents * 0.005 / 100 + 5).toFixed(2)}` },
      message: `Crypto payout of ${cryptoAmount} ${crypto_} initiated (mock). Track on block explorer.`,
    });
  });

  // ================================================================
  // D12 — AI CONTRACT GENERATOR
  // ================================================================
  app.post("/api/vision/ai/contract", async (req, res) => {
    const { jobTitle, jobDescription, budget, currency, freelancerName, clientName, deliverables, deadlineDays } = req.body;
    if (!jobTitle) return res.status(400).json({ message: "jobTitle required" });

    const cur = currency || "ZAR";
    const budgetDisplay = `${cur === "ZAR" ? "R" : "$"}${((budget || 50000) / 100).toLocaleString()}`;
    const deadline = deadlineDays || 30;

    const contractText = `FREELANCE SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString("en-ZA")} between:

CLIENT: ${clientName || "[Client Name]"} ("Client")
FREELANCER: ${freelancerName || "[Freelancer Name]"} ("Freelancer")

1. SCOPE OF WORK
The Freelancer agrees to provide the following services:
Title: ${jobTitle}
Description: ${jobDescription || "As discussed and agreed upon by both parties."}
${deliverables ? `Deliverables:\n${(Array.isArray(deliverables) ? deliverables : [deliverables]).map((d: string, i: number) => `  ${i + 1}. ${d}`).join("\n")}` : ""}

2. COMPENSATION
Total Fee: ${budgetDisplay}
Payment Terms: 50% upon commencement, 50% upon delivery via FreelanceSkills.net escrow system.
Currency: ${cur}

3. TIMELINE
Start Date: Upon agreement execution
Delivery Deadline: ${deadline} calendar days from start date
Revisions: Up to 2 rounds of revisions included

4. INTELLECTUAL PROPERTY
All work product created shall be owned by the Client upon full payment.

5. CONFIDENTIALITY
Both parties agree to keep project details confidential.

6. DISPUTE RESOLUTION
Any disputes shall be mediated through the FreelanceSkills.net platform dispute resolution system before escalation to the Magistrate's Court of South Africa.

7. GOVERNING LAW
This Agreement is governed by the laws of the Republic of South Africa.

AGREED AND ACCEPTED:

Client: _________________________ Date: _____________
Freelancer: _____________________ Date: _____________

Generated by FreelanceSkills.net AI Contract Assistant
Reference: CONTRACT-${Date.now()}`;

    res.json({
      contractId: `CONTRACT-${Date.now()}`,
      contractText,
      metadata: { generatedAt: new Date().toISOString(), version: "1.0", wordCount: contractText.split(/\s+/).length, sections: 7 },
      downloadLinks: {
        pdf: `https://freelanceskills.net/contracts/${Date.now()}.pdf`,
        docx: `https://freelanceskills.net/contracts/${Date.now()}.docx`,
      },
      disclaimer: "This is an AI-generated template. Have it reviewed by a legal professional before signing.",
    });
  });

  // ================================================================
  // D13 — REPUTATION SCORE V2 (WEIGHTED)
  // ================================================================
  app.get("/api/vision/reputation/:userId", async (req, res) => {
    const userId = req.params.userId;
    const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    const userReviews = await db.select().from(reviews).where(eq(reviews.revieweeId, userId));
    const creds = await db.select().from(blockchainCredentials).where(eq(blockchainCredentials.userId, userId));
    const completedJobs = await db.select({ count: count() }).from(bookings).where(and(eq(bookings.freelancerId, userId), eq(bookings.status, "completed")));

    const avgRating = userReviews.length > 0 ? userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length : 0;
    const reviewScore = Math.min(100, avgRating * 20);
    const verificationScore = Math.min(100, creds.filter(c => c.status === "verified").length * 25);
    const jobsScore = Math.min(100, (completedJobs[0]?.count || 0) * 5);
    const academyScore = 0;

    const weights = { reviews: 0.35, verification: 0.25, completedJobs: 0.25, academy: 0.15 };
    const overallScore = Math.round(
      reviewScore * weights.reviews + verificationScore * weights.verification +
      jobsScore * weights.completedJobs + academyScore * weights.academy
    );

    res.json({
      userId,
      overallScore,
      tier: overallScore >= 90 ? "Diamond 💎" : overallScore >= 75 ? "Gold 🥇" : overallScore >= 50 ? "Silver 🥈" : overallScore >= 25 ? "Bronze 🥉" : "New 🌱",
      breakdown: {
        reviews: { score: Math.round(reviewScore), weight: "35%", count: userReviews.length, avgRating: avgRating.toFixed(1) },
        verification: { score: Math.round(verificationScore), weight: "25%", verifiedCredentials: creds.filter(c => c.status === "verified").length },
        completedJobs: { score: Math.round(jobsScore), weight: "25%", count: completedJobs[0]?.count || 0 },
        academy: { score: academyScore, weight: "15%", coursesCompleted: 0 },
      },
      badges: [
        ...(avgRating >= 4.5 ? ["⭐ Top Rated"] : []),
        ...(creds.length > 0 ? ["✅ Verified"] : []),
        ...((completedJobs[0]?.count || 0) >= 10 ? ["🏆 Experienced"] : []),
      ],
    });
  });

  // ================================================================
  // D14 — TALENT MARKETPLACE ANALYTICS (DEMAND HEATMAP)
  // ================================================================
  app.get("/api/vision/analytics/heatmap", async (_req, res) => {
    const jobCounts = await db.select({ category: jobs.category, count: count() }).from(jobs).where(eq(jobs.status, "open")).groupBy(jobs.category);
    const freelancerCounts = await db.select({ count: count() }).from(profiles);

    const heatmapData = [
      { category: "web-development", demand: "high", color: "#ef4444", jobs: 0, avgBudget: 75000 },
      { category: "design", demand: "high", color: "#f97316", jobs: 0, avgBudget: 45000 },
      { category: "writing", demand: "medium", color: "#eab308", jobs: 0, avgBudget: 25000 },
      { category: "marketing", demand: "medium", color: "#22c55e", jobs: 0, avgBudget: 35000 },
      { category: "plumbing", demand: "high", color: "#ef4444", jobs: 0, avgBudget: 30000 },
      { category: "electrical", demand: "high", color: "#ef4444", jobs: 0, avgBudget: 40000 },
      { category: "tutoring", demand: "medium", color: "#eab308", jobs: 0, avgBudget: 20000 },
      { category: "photography", demand: "low", color: "#3b82f6", jobs: 0, avgBudget: 15000 },
    ];

    for (const jc of jobCounts) {
      const entry = heatmapData.find(h => h.category === jc.category);
      if (entry) entry.jobs = jc.count;
    }

    res.json({
      heatmap: heatmapData,
      summary: {
        totalOpenJobs: jobCounts.reduce((s, j) => s + j.count, 0),
        totalFreelancers: freelancerCounts[0]?.count || 0,
        hottestCategory: heatmapData.sort((a, b) => b.jobs - a.jobs)[0]?.category || "web-development",
        updated: new Date().toISOString(),
      },
      regions: [
        { name: "Cape Town", demandLevel: "Very High", topCategory: "web-development" },
        { name: "Johannesburg", demandLevel: "Very High", topCategory: "marketing" },
        { name: "Durban", demandLevel: "High", topCategory: "design" },
        { name: "Pretoria", demandLevel: "High", topCategory: "electrical" },
        { name: "Remote", demandLevel: "Very High", topCategory: "web-development" },
      ],
    });
  });

  // ================================================================
  // D15 — GLOBAL EXPANSION (MULTI-LANGUAGE + EXTENDED CURRENCIES)
  // ================================================================
  app.get("/api/vision/global/languages", (_req, res) => {
    res.json([
      { code: "en", name: "English", native: "English", flag: "🇬🇧", default: true },
      { code: "af", name: "Afrikaans", native: "Afrikaans", flag: "🇿🇦" },
      { code: "zu", name: "Zulu", native: "isiZulu", flag: "🇿🇦" },
      { code: "xh", name: "Xhosa", native: "isiXhosa", flag: "🇿🇦" },
      { code: "st", name: "Sotho", native: "Sesotho", flag: "🇿🇦" },
      { code: "tn", name: "Tswana", native: "Setswana", flag: "🇿🇦" },
      { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
      { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪" },
      { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
      { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
      { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
      { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
    ]);
  });

  app.get("/api/vision/global/currencies", (_req, res) => {
    res.json([
      { code: "ZAR", symbol: "R", rate: 1, name: "South African Rand", flag: "🇿🇦" },
      { code: "USD", symbol: "$", rate: 0.054, name: "US Dollar", flag: "🇺🇸" },
      { code: "EUR", symbol: "€", rate: 0.050, name: "Euro", flag: "🇪🇺" },
      { code: "GBP", symbol: "£", rate: 0.043, name: "British Pound", flag: "🇬🇧" },
      { code: "NGN", symbol: "₦", rate: 82.5, name: "Nigerian Naira", flag: "🇳🇬" },
      { code: "KES", symbol: "KSh", rate: 7.0, name: "Kenyan Shilling", flag: "🇰🇪" },
      { code: "BWP", symbol: "P", rate: 0.73, name: "Botswana Pula", flag: "🇧🇼" },
      { code: "NAD", symbol: "N$", rate: 1.0, name: "Namibian Dollar", flag: "🇳🇦" },
      { code: "MZN", symbol: "MT", rate: 3.45, name: "Mozambican Metical", flag: "🇲🇿" },
      { code: "SZL", symbol: "E", rate: 1.0, name: "Eswatini Lilangeni", flag: "🇸🇿" },
      { code: "INR", symbol: "₹", rate: 4.5, name: "Indian Rupee", flag: "🇮🇳" },
      { code: "BRL", symbol: "R$", rate: 0.27, name: "Brazilian Real", flag: "🇧🇷" },
      { code: "AED", symbol: "د.إ", rate: 0.20, name: "UAE Dirham", flag: "🇦🇪" },
      { code: "USDC", symbol: "USDC", rate: 0.054, name: "USD Coin (Stablecoin)", flag: "🪙" },
    ]);
  });

  // ================================================================
  // D16 — METAVERSE JOB FAIR MOCK
  // ================================================================
  app.get("/api/vision/metaverse/job-fair", (_req, res) => {
    res.json({
      event: {
        name: "FreelanceSkills Metaverse Job Fair 2026",
        date: "2026-09-15",
        platform: "Spatial.io + FreelanceSkills Custom World",
        status: "upcoming",
        registrations: 2847,
      },
      booths: [
        { id: "booth-tech", name: "Tech & Development", virtualUrl: "https://spatial.io/s/FreelanceSkills-Tech", exhibitors: 45, liveJobs: 128 },
        { id: "booth-creative", name: "Creative & Design", virtualUrl: "https://spatial.io/s/FreelanceSkills-Creative", exhibitors: 32, liveJobs: 87 },
        { id: "booth-trades", name: "Skilled Trades", virtualUrl: "https://spatial.io/s/FreelanceSkills-Trades", exhibitors: 28, liveJobs: 65 },
        { id: "booth-education", name: "Education & Tutoring", virtualUrl: "https://spatial.io/s/FreelanceSkills-Education", exhibitors: 18, liveJobs: 42 },
        { id: "booth-networking", name: "Networking Lounge", virtualUrl: "https://spatial.io/s/FreelanceSkills-Lounge", exhibitors: 0, liveJobs: 0 },
      ],
      features: ["3D portfolio showcase", "Live video interviews", "Virtual handshakes (NFT proof)", "AI matchmaking in real-time", "Prize draws for attendees"],
    });
  });

  app.post("/api/vision/metaverse/register-booth", isAuthenticated, async (req: any, res) => {
    const { boothCategory, companyName } = req.body;
    res.json({
      registrationId: `BOOTH-${Date.now()}`,
      boothCategory: boothCategory || "general",
      companyName: companyName || "Independent Freelancer",
      virtualUrl: `https://spatial.io/s/FreelanceSkills-${Date.now()}`,
      status: "confirmed",
      message: "Your virtual booth is reserved! You'll receive setup instructions 7 days before the event.",
    });
  });

  // ================================================================
  // D17 — AI DISPUTE MEDIATOR
  // ================================================================
  app.post("/api/vision/ai/dispute-mediator", isAuthenticated, async (req: any, res) => {
    const { disputeId, chatLog, freelancerClaim, clientClaim } = req.body;
    if (!freelancerClaim && !clientClaim) return res.status(400).json({ message: "At least one claim required" });

    const messages = chatLog ? (Array.isArray(chatLog) ? chatLog.length : 1) : 0;

    res.json({
      disputeId: disputeId || `DISP-${Date.now()}`,
      analysis: {
        messagesAnalyzed: messages,
        sentimentBalance: { freelancer: "frustrated", client: "concerned" },
        keyIssues: [
          "Scope disagreement: Deliverables may not have been clearly defined",
          "Timeline: Work may have exceeded the agreed deadline",
          "Communication: Gaps in communication identified in chat log",
        ],
        faultAssessment: { freelancer: 40, client: 60, unclear: 0 },
      },
      suggestedResolution: {
        primary: "Partial refund of 30% with remaining work to be completed within 7 days",
        alternatives: [
          "Full refund with work returned to freelancer",
          "Freelancer completes remaining deliverables within 14 days at no extra cost",
          "Both parties agree to close with 50/50 split of escrowed funds",
        ],
      },
      nextSteps: [
        "Both parties review the suggested resolution within 48 hours",
        "If agreed, funds are released/refunded automatically via escrow",
        "If no agreement, escalate to human mediator (included in premium)",
      ],
      disclaimer: "AI mediation is advisory. Both parties retain the right to escalate to formal dispute resolution.",
    });
  });

  // ================================================================
  // D18 — FREELANCER HEALTH & WELLNESS TRACKER
  // ================================================================
  app.post("/api/vision/wellness/log", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { logType, durationMinutes, notes } = req.body;
      if (!logType) return res.status(400).json({ message: "logType required (work, break, exercise, meditation)" });

      const [log] = await db.insert(wellnessLogs).values({ userId, logType, durationMinutes: durationMinutes || 0, notes }).returning();
      res.json({ ...log, message: logType === "break" ? "Great job taking a break! 🧘" : logType === "exercise" ? "Exercise logged! Stay active 💪" : "Logged successfully" });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/vision/wellness/stats", isAuthenticated, async (req: any, res) => {
    const userId = (req.session as any).userId;
    const logs = await db.select().from(wellnessLogs).where(eq(wellnessLogs.userId, userId)).orderBy(desc(wellnessLogs.createdAt));

    const today = new Date().toISOString().split("T")[0];
    const todayLogs = logs.filter(l => l.createdAt.toISOString().startsWith(today));
    const workMinutes = todayLogs.filter(l => l.logType === "work").reduce((s, l) => s + (l.durationMinutes || 0), 0);
    const breakMinutes = todayLogs.filter(l => l.logType === "break").reduce((s, l) => s + (l.durationMinutes || 0), 0);

    res.json({
      today: {
        workMinutes, breakMinutes,
        workBreakRatio: workMinutes > 0 ? `${Math.round(workMinutes / Math.max(1, breakMinutes))}:1` : "0:0",
        recommendation: breakMinutes < workMinutes * 0.15 ? "Take more breaks! Aim for 10min per hour." : workMinutes > 480 ? "You've worked 8+ hours today. Consider wrapping up." : "Good balance! Keep it up.",
      },
      totalLogs: logs.length,
      streak: logs.length > 0 ? Math.min(logs.length, 7) : 0,
      tips: [
        "Follow the 52/17 rule: 52 minutes of work, 17 minutes of break",
        "Stand up and stretch every hour",
        "Stay hydrated — aim for 2L of water daily",
        "Use the Pomodoro technique: 25min work, 5min break",
      ],
    });
  });

  // ================================================================
  // D19 — IMPACT NFT COLLECTION (1 PER 100 JOBS)
  // ================================================================
  app.get("/api/vision/nft/impact-collection", async (_req, res) => {
    const totalJobs = await db.select({ count: count() }).from(jobs);
    const milestonesReached = Math.floor((totalJobs[0]?.count || 0) / 100);
    const collection = [];
    for (let i = 1; i <= milestonesReached; i++) {
      collection.push({
        milestone: i * 100,
        tokenId: `IMPACT-${i.toString().padStart(4, "0")}`,
        name: `${i * 100} Jobs Created`,
        description: `FreelanceSkills.net created ${i * 100} job opportunities in South Africa`,
        imageUrl: `https://freelanceskills.net/nft/impact/${i}.png`,
        rarity: i <= 1 ? "Genesis" : i <= 5 ? "Rare" : i <= 20 ? "Uncommon" : "Common",
      });
    }
    res.json({
      totalJobsCreated: totalJobs[0]?.count || 0,
      nextMilestone: (milestonesReached + 1) * 100,
      progress: `${((totalJobs[0]?.count || 0) % 100)}%`,
      collection,
      goal: "1,000,000 jobs by 2031 🇿🇦",
    });
  });

  app.post("/api/vision/nft/mint-impact", isAuthenticated, async (req: any, res) => {
    const { milestone } = req.body;
    res.json({
      tokenId: `IMPACT-${(milestone || 100).toString().padStart(4, "0")}`,
      txHash: mockTxHash(),
      name: `${milestone || 100} Jobs Milestone`,
      status: "minted",
      contract: "0xFSK...ImpactNFT",
      message: `Impact NFT minted for ${milestone || 100} jobs milestone! 🎉`,
    });
  });

  // ================================================================
  // D20 — ZERO-KNOWLEDGE PROOF FOR PRIVATE EARNINGS
  // ================================================================
  app.post("/api/vision/zkp/prove-earnings", isAuthenticated, async (req: any, res) => {
    const { earningsRange, currency } = req.body;
    const range = earningsRange || "50k-100k";

    const proof = {
      proofId: `ZKP-${Date.now()}`,
      commitment: mockHash(`earnings-${range}-${Date.now()}`),
      nullifier: mockHash(`null-${Date.now()}`),
      publicSignals: [range, currency || "ZAR"],
    };

    res.json({
      ...proof,
      verified: true,
      statement: `Proof generated: Earnings are in the ${range} ${currency || "ZAR"} range`,
      protocol: "Groth16 (simulated)",
      verificationUrl: `https://freelanceskills.net/verify-zkp/${proof.proofId}`,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      message: "Zero-knowledge proof generated. Share the verification URL to prove your earning range without revealing exact amounts.",
    });
  });

  app.post("/api/vision/zkp/verify", async (req, res) => {
    const { proofId, commitment } = req.body;
    if (!proofId) return res.status(400).json({ message: "proofId required" });

    res.json({
      proofId, valid: true,
      verifiedAt: new Date().toISOString(),
      protocol: "Groth16 (simulated)",
      message: "Zero-knowledge proof is valid. The stated earning range is verified without revealing exact amounts.",
    });
  });

  // ================================================================
  // D21 — QUANTUM-SAFE ENCRYPTION STUB
  // ================================================================
  app.get("/api/vision/security/quantum-status", (_req, res) => {
    res.json({
      currentEncryption: { algorithm: "AES-256-GCM", keyExchange: "ECDH P-256", status: "active" },
      quantumSafe: {
        algorithm: "CRYSTALS-Kyber (KEM)", signatureScheme: "CRYSTALS-Dilithium",
        status: "ready",
        nistStandard: "FIPS 203/204 (Post-Quantum)",
        migrationPlan: {
          phase1: { name: "Hybrid Mode", status: "testing", description: "Classical + PQ algorithms in parallel" },
          phase2: { name: "Full PQ Migration", status: "planned", description: "Complete transition to quantum-safe algorithms" },
          phase3: { name: "Quantum Key Distribution", status: "research", description: "QKD for ultra-sensitive financial data" },
        },
      },
      threatAssessment: {
        quantumThreatLevel: "Low (current)", timelineToThreat: "2030-2035 estimated",
        recommendation: "Start hybrid migration now for long-term data protection",
      },
    });
  });

  app.post("/api/vision/security/quantum-encrypt", async (req, res) => {
    const { data, algorithm } = req.body;
    if (!data) return res.status(400).json({ message: "data required" });

    const algo = algorithm || "kyber-768";
    const encrypted = mockHash(typeof data === "string" ? data : JSON.stringify(data));

    res.json({
      encrypted: encrypted.substring(0, 64),
      algorithm: algo,
      keySize: algo === "kyber-1024" ? 1568 : algo === "kyber-768" ? 1184 : 800,
      ciphertextSize: algo === "kyber-1024" ? 1568 : 1088,
      securityLevel: algo === "kyber-1024" ? "AES-256 equivalent" : "AES-192 equivalent",
      quantumSafe: true,
      decryptionKeyId: `QK-${Date.now()}`,
      message: `Data encrypted with ${algo} (post-quantum stub). Resistant to both classical and quantum attacks.`,
    });
  });

  // ================================================================
  // D22 — AI MENTOR MATCHING
  // ================================================================
  app.post("/api/vision/ai/mentor-match", isAuthenticated, async (req: any, res) => {
    try {
      const menteeId = (req.session as any).userId;
      const { skills, preferredCategory, experienceLevel } = req.body;

      const veterans = await db.select().from(profiles).limit(10);
      const matchedMentor = veterans.length > 0 ? veterans[Math.floor(Math.random() * veterans.length)] : null;

      if (!matchedMentor) {
        return res.json({ matched: false, message: "No mentors available yet. Be the first veteran to sign up as a mentor!" });
      }

      const matchScore = Math.round((70 + Math.random() * 25) * 10) / 10;
      const [match] = await db.insert(mentorMatches).values({
        mentorId: matchedMentor.userId, menteeId, aiMatchScore: matchScore, status: "pending",
      }).returning();

      res.json({
        matched: true,
        matchId: match.id,
        mentor: { userId: matchedMentor.userId, name: matchedMentor.fullName || "Experienced Freelancer", skills: matchedMentor.skills },
        matchScore,
        matchReasons: [
          skills ? `Shared skills: ${skills.join(", ")}` : "Complementary skill set",
          `Category alignment: ${preferredCategory || "general"}`,
          `Experience gap suitable for mentoring (${experienceLevel || "beginner"} ↔ veteran)`,
        ],
        nextSteps: ["Mentor receives notification", "Schedule intro call via Messages", "Set weekly check-in goals"],
      });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/vision/ai/mentor-pairs", async (_req, res) => {
    const pairs = await db.select().from(mentorMatches).orderBy(desc(mentorMatches.createdAt)).limit(20);
    res.json({ totalPairs: pairs.length, pairs });
  });

  // ================================================================
  // D23 — SUSTAINABLE CATEGORY FILTER (ECO-FRIENDLY BOOST)
  // ================================================================
  app.get("/api/vision/sustainable/categories", (_req, res) => {
    res.json([
      { id: "renewable-energy", name: "Renewable Energy", icon: "☀️", boost: 25, description: "Solar, wind, and green energy projects" },
      { id: "recycling", name: "Recycling & Upcycling", icon: "♻️", boost: 20, description: "Waste management and upcycling projects" },
      { id: "organic-farming", name: "Organic Farming", icon: "🌾", boost: 20, description: "Sustainable agriculture and farming" },
      { id: "eco-construction", name: "Eco Construction", icon: "🏗️", boost: 15, description: "Green building and sustainable architecture" },
      { id: "water-conservation", name: "Water Conservation", icon: "💧", boost: 20, description: "Water-saving solutions and plumbing" },
      { id: "education", name: "Environmental Education", icon: "📚", boost: 15, description: "Teaching sustainability and eco-awareness" },
      { id: "wildlife", name: "Wildlife & Conservation", icon: "🦁", boost: 25, description: "Wildlife protection and eco-tourism" },
      { id: "remote-work", name: "Remote Work (Zero Commute)", icon: "🏠", boost: 10, description: "All remote jobs automatically get an eco-boost" },
    ]);
  });

  app.get("/api/vision/sustainable/jobs", async (_req, res) => {
    const allJobs = await db.select().from(jobs).where(eq(jobs.status, "open")).orderBy(desc(jobs.createdAt)).limit(50);
    const ecoCategories = ["renewable-energy", "recycling", "organic-farming", "eco-construction", "water-conservation", "education", "wildlife"];
    const ecoJobs = allJobs.map(j => ({
      ...j,
      ecoBoost: ecoCategories.includes(j.category) ? 25 : j.location?.toLowerCase() === "remote" ? 10 : 0,
      sustainabilityBadge: ecoCategories.includes(j.category) ? "🌿 Eco-Verified" : j.location?.toLowerCase() === "remote" ? "🏠 Zero Commute" : null,
    })).sort((a, b) => b.ecoBoost - a.ecoBoost);

    res.json({ jobs: ecoJobs, totalEcoJobs: ecoJobs.filter(j => j.ecoBoost > 0).length });
  });

  // ================================================================
  // D24 — 2031 ROADMAP DATA (API backing frontend component)
  // ================================================================
  app.get("/api/vision/roadmap", (_req, res) => {
    res.json({
      vision: "1 Million Jobs by 2031 — FreelanceSkills.net",
      phases: [
        { year: 2024, name: "Foundation", status: "live", progress: 100, features: ["Platform launch", "Job board", "Service packages", "PayFast payments", "User profiles"] },
        { year: 2025, name: "Growth", status: "live", progress: 100, features: ["AI matching", "Academy", "Referral program", "Business invites", "Real-time chat"] },
        { year: 2026, name: "AI & Security", status: "building", progress: 75, features: ["AI proposals", "Fraud detection", "Escrow system", "Premium tiers", "Growth engine", "Mobile app"] },
        { year: 2027, name: "Blockchain & Trust", status: "planned", progress: 15, features: ["NFT badges", "Self-sovereign ID", "DAO governance", "Crypto payouts", "ZK proofs"] },
        { year: 2028, name: "Global Expansion", status: "planned", progress: 5, features: ["Multi-language (12 languages)", "Africa-wide launch", "Global partnerships", "Enterprise API"] },
        { year: 2029, name: "Metaverse & AR", status: "planned", progress: 0, features: ["Virtual job fairs", "AR portfolios", "VR interviews", "3D workspaces"] },
        { year: 2030, name: "Sustainability", status: "planned", progress: 0, features: ["Carbon tracking", "Impact NFTs", "Green categories", "Eco partnerships", "Wellness tracker"] },
        { year: 2031, name: "Vision Complete", status: "planned", progress: 0, features: ["1M jobs created", "Pan-African leader", "Quantum-safe security", "Full DAO governance", "AI mentor network"] },
      ],
      milestones: {
        jobsCreated: 0, targetJobs: 1000000,
        countriesActive: 1, targetCountries: 54,
        freelancersRegistered: 0, targetFreelancers: 500000,
      },
    });
  });

  // ================================================================
  // D25 — DEMO LINKS & STATUS (ALL VISION FEATURES)
  // ================================================================
  app.get("/api/vision/demo-links", (_req, res) => {
    const base = "https://freelanceskills.net/api/vision";
    res.json({
      title: "FreelanceSkills 2031 Vision — Live Demo Links",
      version: "1.0.0",
      features: [
        { id: "D1", name: "Blockchain Credential Verification", status: "stub", endpoints: [`POST ${base}/blockchain/verify`, `GET ${base}/blockchain/credentials/:userId`] },
        { id: "D2", name: "NFT Badge Certification", status: "stub", endpoints: [`POST ${base}/nft/mint-badge`, `GET ${base}/nft/badges/:userId`] },
        { id: "D3", name: "Green Impact Scoring", status: "stub", endpoints: [`POST ${base}/green/calculate`, `GET ${base}/green/score/:userId`] },
        { id: "D4", name: "Carbon Offset Partnership", status: "stub", endpoints: [`POST ${base}/green/offset`, `GET ${base}/green/offsets`] },
        { id: "D5", name: "AI Video Interview Screening", status: "stub", endpoints: [`POST ${base}/ai/video-interview`] },
        { id: "D6", name: "Voice AI Job Post", status: "stub", endpoints: [`POST ${base}/ai/voice-job-post`] },
        { id: "D7", name: "AR Portfolio Preview", status: "stub", endpoints: [`POST ${base}/ar/portfolio-preview`] },
        { id: "D8", name: "Predictive Earnings Forecast", status: "stub", endpoints: [`POST ${base}/ai/earnings-forecast`] },
        { id: "D9", name: "Community Forum", status: "stub", endpoints: [`GET ${base}/forum/categories`, `GET ${base}/forum/posts`, `POST ${base}/forum/posts`] },
        { id: "D10", name: "DAO Governance", status: "stub", endpoints: [`GET ${base}/dao/proposals`, `POST ${base}/dao/proposals`, `POST ${base}/dao/vote`] },
        { id: "D11", name: "Crypto Payout", status: "stub", endpoints: [`GET ${base}/crypto/rates`, `POST ${base}/crypto/payout`] },
        { id: "D12", name: "AI Contract Generator", status: "stub", endpoints: [`POST ${base}/ai/contract`] },
        { id: "D13", name: "Reputation Score v2", status: "stub", endpoints: [`GET ${base}/reputation/:userId`] },
        { id: "D14", name: "Talent Marketplace Heatmap", status: "stub", endpoints: [`GET ${base}/analytics/heatmap`] },
        { id: "D15", name: "Global Multi-Language", status: "stub", endpoints: [`GET ${base}/global/languages`, `GET ${base}/global/currencies`] },
        { id: "D16", name: "Metaverse Job Fair", status: "stub", endpoints: [`GET ${base}/metaverse/job-fair`, `POST ${base}/metaverse/register-booth`] },
        { id: "D17", name: "AI Dispute Mediator", status: "stub", endpoints: [`POST ${base}/ai/dispute-mediator`] },
        { id: "D18", name: "Wellness Tracker", status: "stub", endpoints: [`POST ${base}/wellness/log`, `GET ${base}/wellness/stats`] },
        { id: "D19", name: "Impact NFT Collection", status: "stub", endpoints: [`GET ${base}/nft/impact-collection`, `POST ${base}/nft/mint-impact`] },
        { id: "D20", name: "Zero-Knowledge Proofs", status: "stub", endpoints: [`POST ${base}/zkp/prove-earnings`, `POST ${base}/zkp/verify`] },
        { id: "D21", name: "Quantum-Safe Encryption", status: "stub", endpoints: [`GET ${base}/security/quantum-status`, `POST ${base}/security/quantum-encrypt`] },
        { id: "D22", name: "AI Mentor Matching", status: "stub", endpoints: [`POST ${base}/ai/mentor-match`, `GET ${base}/ai/mentor-pairs`] },
        { id: "D23", name: "Sustainable Job Categories", status: "stub", endpoints: [`GET ${base}/sustainable/categories`, `GET ${base}/sustainable/jobs`] },
        { id: "D24", name: "2031 Roadmap Timeline", status: "live", endpoints: [`GET ${base}/roadmap`, "GET /roadmap (frontend)"] },
        { id: "D25", name: "Demo Links & Status", status: "live", endpoints: [`GET ${base}/demo-links`] },
      ],
      totalFeatures: 25,
      liveCount: 2,
      stubCount: 23,
      frontendPage: "https://freelanceskills.net/roadmap",
    });
  });
}
