import { 
  type Job, type InsertJob, type Profile, type InsertProfile, 
  type ServicePackage, type InsertServicePackage, type Booking, type InsertBooking,
  type Review, type InsertReview, type Conversation, type Message, type InsertMessage,
  type InsertEnterpriseLead, type EnterpriseLead,
  type AggregatedJob, type InsertAggregatedJob, type JobApplication, type InsertJobApplication,
  type BusinessInvitation, type InsertBusinessInvitation,
  type Referral, type InsertReferral,
  type Course, type InsertCourse, type Lesson, type InsertLesson, type CourseProgress, type InsertCourseProgress, type Certificate, type InsertCertificate,
  type Notification, type InsertNotification, HIGH_PRIORITY_NOTIFICATION_TYPES,
  type FraudFlag, type InsertFraudFlag,
  type AuditLog, type InsertAuditLog,
  type EscrowTransaction, type InsertEscrowTransaction,
  type PremiumTier, type InsertPremiumTier,
  type Dispute, type InsertDispute,
  jobs, profiles, servicePackages, bookings, reviews, conversations, messages,
  freelancerVerifications, privateFeedback, enterpriseLeads, aggregatedJobs, jobApplications,
  businessInvitations, referrals, courses, lessons, courseProgress, certificates, notifications,
  fraudFlags, auditLogs, escrowTransactions, premiumTiers, disputes, users
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, or, sql, desc, count, isNull } from "drizzle-orm";

export interface IStorage {
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  updateJobStatus(id: string, status: string, freelancerId?: string): Promise<Job | undefined>;
  
  // Profile operations
  createProfile(profile: InsertProfile): Promise<Profile>;
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileById(id: string): Promise<Profile | undefined>;
  updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile | undefined>;
  updateProfileById(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined>;
  listFreelancerProfiles(): Promise<Profile[]>;
  countOpenDisputesForFreelancer(freelancerUserId: string): Promise<number>;
  savePortfolioProject(userId: string, project: { title: string; description: string; link: string; technologies: string[] }): Promise<Profile | undefined>;
  searchFreelancers(query?: string, location?: string, opts?: { verifiedOnly?: boolean; availableNow?: boolean; maxRateCents?: number; minRating?: number; minJobs?: number; limit?: number; offset?: number }): Promise<Profile[]>;

  // Service Package operations (TaskRabbit-style)
  createServicePackage(pkg: InsertServicePackage): Promise<ServicePackage>;
  getServicePackage(id: string): Promise<ServicePackage | undefined>;
  getFreelancerPackages(freelancerId: string): Promise<ServicePackage[]>;
  getAllPackages(category?: string): Promise<ServicePackage[]>;
  getActiveServicePackages(): Promise<ServicePackage[]>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getUserBookings(userId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getFreelancerReviews(freelancerId: string): Promise<Review[]>;
  getReviewsForUser(userId: string): Promise<Review[]>;
  
  // Messaging operations
  getConversation(id: string): Promise<Conversation | undefined>;
  getOrCreateConversation(user1Id: string, user2Id: string, jobId?: string): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<number>;
  
  // Verification operations
  getFreelancerVerification(freelancerId: string): Promise<any>;
  submitVerification(freelancerId: string, data: any): Promise<any>;
  
  // Private feedback operations
  submitPrivateFeedback(feedback: any): Promise<any>;
  hasPublicReview(bookingId: string, userId: string): Promise<boolean>;
  hasPrivateFeedback(bookingId: string, userId: string): Promise<boolean>;

  // Enterprise lead operations
  createEnterpriseLead(lead: InsertEnterpriseLead): Promise<EnterpriseLead>;

  // Aggregated job operations
  createAggregatedJob(job: InsertAggregatedJob): Promise<AggregatedJob>;
  createManyAggregatedJobs(jobs: InsertAggregatedJob[]): Promise<AggregatedJob[]>;
  getAggregatedJobs(filters?: { province?: string; category?: string; source?: string; jobType?: string }): Promise<AggregatedJob[]>;
  getAggregatedJobCount(): Promise<number>;
  countAggregatedJobs(filters?: {
    province?: string;
    country?: string;
    category?: string;
    source?: string;
    jobType?: string;
    experienceLevel?: string;
    isUrgent?: boolean;
    isRemote?: boolean;
    search?: string;
  }): Promise<number>;
  getExistingApplyUrls(): Promise<Set<string>>;
  getAggregatedJobStats(provinces: string[], countries: string[], categories: string[]): Promise<{ totalActive: number; urgent: number; remote: number; aiGenerated: number; avgScore: number; byProvince: Record<string, number>; byCountry: Record<string, number>; byCategory: Record<string, number>; bySource: Record<string, number> }>;
  clearOldAggregatedJobs(): Promise<void>;
  deleteAgentGeneratedJobs(): Promise<number>;

  // Job application operations
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getUserApplications(userId: string): Promise<JobApplication[]>;
  getJobApplicants(jobId: string): Promise<Array<JobApplication & { freelancerName: string; freelancerEmail: string | null; profileTitle: string | null; profileBio: string | null; profilePhotoUrl: string | null; hourlyRate: number | null; rating: number | null; completedJobs: number }>>;
  updateJobApplication(id: string, updates: Partial<Pick<JobApplication, "status" | "notes" | "aiCoverLetter" | "employabilityScore" | "interviewDate">>): Promise<JobApplication | undefined>;

  // Business invitation operations
  createBusinessInvitation(invitation: InsertBusinessInvitation): Promise<BusinessInvitation>;
  createManyBusinessInvitations(invitations: InsertBusinessInvitation[]): Promise<BusinessInvitation[]>;
  getBusinessInvitation(id: string): Promise<BusinessInvitation | undefined>;
  getBusinessInvitationByCode(code: string): Promise<BusinessInvitation | undefined>;
  claimBusinessInvitation(code: string, userId: string): Promise<BusinessInvitation | undefined>;
  getAllBusinessInvitations(filters?: { province?: string; category?: string; status?: string }): Promise<BusinessInvitation[]>;
  getBusinessInvitationStats(): Promise<{ total: number; pending: number; claimed: number }>;
  searchBusinessInvitations(query: string): Promise<BusinessInvitation[]>;
  getGlobalStats(): Promise<{ jobs: number; profiles: number; bookings: number; messages: number }>;

  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  getReferralsByReferrer(referrerId: string): Promise<Referral[]>;
  getReferralsByUser(userId: string): Promise<Referral[]>;
  getReferralByReferrer(referrerId: string): Promise<Referral | undefined>;
  updateReferralStatus(id: number, status: string, referredUserId?: string): Promise<Referral | undefined>;
  getReferralStats(userId: string): Promise<{ 
    totalReferred: number; 
    totalEarned: number; 
    pendingRewards: number; 
    tier: string;
    referralCode?: string;
  }>;

  // Academy operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCourseLessons(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  getCourseProgress(userId: string, courseId: number): Promise<CourseProgress[]>;
  markLessonComplete(userId: string, courseId: number, lessonId: number): Promise<CourseProgress>;
  getCertificate(userId: string, courseId: number): Promise<Certificate | undefined>;
  issueCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getUserCertificates(userId: string): Promise<Certificate[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;

  // Account operations
  exportUserData(userId: string): Promise<any>;
  deleteUserAccount(userId: string): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markAsRead(id: number): Promise<Notification | undefined>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;

  // Fraud operations
  createFraudFlag(flag: InsertFraudFlag): Promise<FraudFlag>;
  getFraudFlag(id: number): Promise<FraudFlag | undefined>;
  getFraudFlagsByBooking(bookingId: string): Promise<FraudFlag[]>;
  getUnresolvedFraudFlags(): Promise<FraudFlag[]>;
  resolveFraudFlag(id: number, resolution: string, resolvedBy: string): Promise<FraudFlag | undefined>;

  // Audit log operations (#44)
  createAuditLog(log: Partial<InsertAuditLog>): Promise<AuditLog>;
  getAuditLogs(filters?: { userId?: string; action?: string; resource?: string; limit?: number }): Promise<AuditLog[]>;

  // Dispute operations (#49)
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  getDispute(id: number): Promise<Dispute | undefined>;
  getDisputesByUser(userId: string): Promise<Dispute[]>;
  getAllDisputes(status?: string): Promise<Dispute[]>;
  resolveDispute(id: number, adminId: string, resolution: string): Promise<Dispute | undefined>;

  // Escrow operations (#41/#48)
  createEscrowTransaction(tx: InsertEscrowTransaction): Promise<EscrowTransaction>;
  getEscrowByBooking(bookingId: string): Promise<EscrowTransaction | undefined>;
  updateEscrowStatus(id: number, status: string): Promise<EscrowTransaction | undefined>;
  getEscrowStats(): Promise<{ held: number; released: number; refunded: number }>;

  // Premium tier operations (#45)
  getPremiumTier(userId: string): Promise<PremiumTier | undefined>;
  upsertPremiumTier(tier: InsertPremiumTier): Promise<PremiumTier>;

  // Raw SQL query (used by routes that need complex JOINs)
  query(sql: string, params?: any[]): Promise<any[]>;
}

class DatabaseStorage implements IStorage {
  // Job operations
  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async updateJobStatus(id: string, status: string, freelancerId?: string): Promise<Job | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (freelancerId) updates.freelancerId = freelancerId;
    
    const [job] = await db
      .update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  // Profile operations
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async updateProfileById(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  }

  async listFreelancerProfiles(): Promise<Profile[]> {
    return db.select().from(profiles).where(eq(profiles.userType, "freelancer"));
  }

  async countOpenDisputesForFreelancer(freelancerUserId: string): Promise<number> {
    const [row] = await db
      .select({ c: count() })
      .from(disputes)
      .where(and(
        eq(disputes.freelancerId, freelancerUserId),
        isNull(disputes.resolvedAt),
        isNull(disputes.closedAt),
      ));
    return Number(row?.c ?? 0);
  }

  async savePortfolioProject(userId: string, project: { title: string; description: string; link: string; technologies: string[] }): Promise<Profile | undefined> {
    const profile = await this.getProfile(userId);
    const existing = Array.isArray(profile?.portfolioProjects) ? profile.portfolioProjects : [];
    const next = [{ id: String(Date.now()), ...project }, ...existing].slice(0, 12);
    const [updated] = await db
      .update(profiles)
      .set({ portfolioProjects: next, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  async searchFreelancers(
    query?: string,
    location?: string,
    opts?: {
      verifiedOnly?: boolean;
      availableNow?: boolean;
      maxRateCents?: number;
      minRating?: number;
      minJobs?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<Profile[]> {
    const conditions: any[] = [
      eq(profiles.userType, "freelancer"),
      eq(profiles.status, "active"),
    ];

    if (query) {
      const q = `%${query}%`;
      conditions.push(
        sql`(${profiles.title} ILIKE ${q} OR ${profiles.bio} ILIKE ${q} OR ${profiles.location} ILIKE ${q} OR EXISTS (SELECT 1 FROM unnest(${profiles.skills}) skill WHERE skill ILIKE ${q}))`
      );
    }

    if (location) {
      conditions.push(sql`${profiles.location} ILIKE ${'%' + location + '%'}`);
    }

    if (opts?.verifiedOnly) {
      conditions.push(eq(profiles.kycStatus, "verified"));
    }

    if (opts?.maxRateCents) {
      conditions.push(sql`${profiles.hourlyRate} <= ${opts.maxRateCents}`);
    }

    if (opts?.minRating) {
      conditions.push(sql`${profiles.rating} >= ${opts.minRating}`);
    }

    if (opts?.minJobs) {
      conditions.push(sql`${profiles.completedJobs} >= ${opts.minJobs}`);
    }

    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    return db
      .select()
      .from(profiles)
      .where(and(...conditions))
      .orderBy(desc(profiles.rating), desc(profiles.completedJobs))
      .limit(limit)
      .offset(offset);
  }

  // Service Package operations
  async createServicePackage(pkg: InsertServicePackage): Promise<ServicePackage> {
    const [servicePackage] = await db.insert(servicePackages).values(pkg).returning();
    return servicePackage;
  }

  async getServicePackage(id: string): Promise<ServicePackage | undefined> {
    const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, id));
    return pkg;
  }

  async getFreelancerPackages(freelancerId: string): Promise<ServicePackage[]> {
    return db.select().from(servicePackages)
      .where(and(eq(servicePackages.freelancerId, freelancerId), eq(servicePackages.isActive, true)))
      .orderBy(desc(servicePackages.createdAt));
  }

  async getAllPackages(category?: string): Promise<ServicePackage[]> {
    if (category) {
      return db.select().from(servicePackages)
        .where(and(eq(servicePackages.isActive, true), eq(servicePackages.category, category)))
        .orderBy(desc(servicePackages.bookingCount));
    }
    return db.select().from(servicePackages)
      .where(eq(servicePackages.isActive, true))
      .orderBy(desc(servicePackages.bookingCount));
  }

  async getActiveServicePackages(): Promise<ServicePackage[]> {
    return db.select().from(servicePackages)
      .where(eq(servicePackages.isActive, true))
      .orderBy(desc(servicePackages.bookingCount));
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return db.select().from(bookings)
      .where(or(eq(bookings.clientId, userId), eq(bookings.freelancerId, userId)))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getFreelancerReviews(freelancerId: string): Promise<Review[]> {
    return db.select().from(reviews)
      .where(eq(reviews.revieweeId, freelancerId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    const { or } = await import("drizzle-orm");
    return db.select().from(reviews)
      .where(or(eq(reviews.revieweeId, userId), eq(reviews.reviewerId, userId)))
      .orderBy(desc(reviews.createdAt));
  }

  // Messaging operations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getOrCreateConversation(user1Id: string, user2Id: string, jobId?: string): Promise<Conversation> {
    const existing = await db.select().from(conversations)
      .where(or(
        and(eq(conversations.participant1Id, user1Id), eq(conversations.participant2Id, user2Id)),
        and(eq(conversations.participant1Id, user2Id), eq(conversations.participant2Id, user1Id))
      ));
    
    if (existing.length > 0) return existing[0];
    
    const [conversation] = await db.insert(conversations)
      .values({ participant1Id: user1Id, participant2Id: user2Id, jobId })
      .returning();
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return db.select().from(conversations)
      .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    return newMessage;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<number> {
    const result = await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isRead, false),
          sql`${messages.senderId} != ${userId}`
        )
      )
      .returning();
    return result.length;
  }

  // Verification operations
  async getFreelancerVerification(freelancerId: string): Promise<any> {
    const [verification] = await db.select().from(freelancerVerifications)
      .where(eq(freelancerVerifications.freelancerId, freelancerId));
    return verification;
  }

  async submitVerification(freelancerId: string, data: any): Promise<any> {
    const existing = await this.getFreelancerVerification(freelancerId);
    
    const updateData: any = {};
    
    if (data.verificationType === 'identity') {
      updateData.identityDocType = data.documentUrls?.[0] ? 'pending_review' : null;
    } else if (data.verificationType === 'qualifications') {
      updateData.qualificationDocs = data.documentUrls;
    } else if (data.verificationType === 'experience') {
      updateData.claimedYearsExperience = data.claimedYearsExperience;
      updateData.referenceContacts = data.referenceContacts;
    } else if (data.verificationType === 'professional_body') {
      updateData.professionalBodyName = data.professionalBodyCode;
      updateData.registrationNumber = data.registrationNumber;
    }

    if (existing) {
      const [updated] = await db.update(freelancerVerifications)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(freelancerVerifications.freelancerId, freelancerId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(freelancerVerifications)
        .values({ freelancerId, ...updateData })
        .returning();
      return created;
    }
  }

  // Private feedback operations
  async submitPrivateFeedback(feedback: any): Promise<any> {
    const [created] = await db.insert(privateFeedback).values(feedback).returning();
    return created;
  }

  async hasPublicReview(bookingId: string, userId: string): Promise<boolean> {
    const existing = await db.select().from(reviews)
      .where(and(eq(reviews.bookingId, bookingId), eq(reviews.reviewerId, userId)));
    return existing.length > 0;
  }

  async hasPrivateFeedback(bookingId: string, userId: string): Promise<boolean> {
    const existing = await db.select().from(privateFeedback)
      .where(and(eq(privateFeedback.bookingId, bookingId), eq(privateFeedback.reviewerId, userId)));
    return existing.length > 0;
  }

  // Enterprise lead operations
  async createEnterpriseLead(lead: InsertEnterpriseLead): Promise<EnterpriseLead> {
    const [created] = await db.insert(enterpriseLeads).values(lead).returning();
    return created;
  }

  // Aggregated job operations
  async createAggregatedJob(job: InsertAggregatedJob): Promise<AggregatedJob> {
    const [created] = await db.insert(aggregatedJobs).values(job).returning();
    return created;
  }

  async createManyAggregatedJobs(jobsData: InsertAggregatedJob[]): Promise<AggregatedJob[]> {
    if (jobsData.length === 0) return [];
    return db.insert(aggregatedJobs).values(jobsData).returning();
  }

  async getAggregatedJobs(filters?: { province?: string; category?: string; source?: string; jobType?: string }): Promise<AggregatedJob[]> {
    const conditions = [eq(aggregatedJobs.isActive, true)];
    
    if (filters?.province) {
      conditions.push(sql`${aggregatedJobs.province} ILIKE ${'%' + filters.province + '%'}`);
    }
    if (filters?.category) {
      conditions.push(sql`${aggregatedJobs.category} ILIKE ${'%' + filters.category + '%'}`);
    }
    if (filters?.source) {
      conditions.push(eq(aggregatedJobs.source, filters.source));
    }
    if (filters?.jobType) {
      conditions.push(eq(aggregatedJobs.jobType, filters.jobType));
    }
    
    return db.select().from(aggregatedJobs)
      .where(and(...conditions))
      .orderBy(desc(aggregatedJobs.postedDate))
      .limit(100);
  }

  async getAggregatedJobCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(aggregatedJobs).where(eq(aggregatedJobs.isActive, true));
    return result[0]?.count || 0;
  }

  // Count aggregated jobs matching the same filter set as searchAggregatedJobs
  // Used for the total field in the jobs API response.
  async countAggregatedJobs(filters?: {
    province?: string;
    country?: string;
    category?: string;
    source?: string;
    jobType?: string;
    experienceLevel?: string;
    isUrgent?: boolean;
    isRemote?: boolean;
    search?: string;
  }): Promise<number> {
    const conditions = [eq(aggregatedJobs.isActive, true)];

    if (filters?.country && filters.country !== "all") {
      if (filters.country === "South Africa") {
        conditions.push(
          sql`${aggregatedJobs.province} = ANY(ARRAY['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','Free State','North West','Northern Cape']::text[])`,
        );
      } else {
        conditions.push(eq(aggregatedJobs.country, filters.country));
      }
    } else if (filters?.province) {
      conditions.push(eq(aggregatedJobs.province, filters.province));
    }
    if (filters?.category) {
      conditions.push(eq(aggregatedJobs.category, filters.category));
    }
    if (filters?.source) {
      conditions.push(eq(aggregatedJobs.liveSource, filters.source));
    }
    if (filters?.jobType) {
      conditions.push(eq(aggregatedJobs.jobType, filters.jobType));
    }
    if (filters?.experienceLevel) {
      conditions.push(eq(aggregatedJobs.experienceLevel, filters.experienceLevel));
    }
    if (filters?.isUrgent) {
      conditions.push(eq(aggregatedJobs.isUrgent, true));
    }
    if (filters?.isRemote) {
      conditions.push(eq(aggregatedJobs.isRemote, true));
    }
    if (filters?.search) {
      const q = filters.search.trim();
      if (q.length >= 3) {
        conditions.push(
          sql`to_tsvector('english',
                coalesce(${aggregatedJobs.title},'') || ' ' ||
                coalesce(${aggregatedJobs.company},'') || ' ' ||
                coalesce(${aggregatedJobs.skills},'')
              ) @@ plainto_tsquery('english', ${q})`,
        );
      } else {
        conditions.push(
          sql`(${aggregatedJobs.title} ILIKE ${q + "%"} OR ${aggregatedJobs.company} ILIKE ${q + "%"})`,
        );
      }
    }

    const result = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(aggregatedJobs)
      .where(and(...conditions));
    return result[0]?.count || 0;
  }

  // Returns a Set of all existing apply_url values — used for efficient dedup during live fetch.
  // Single-column scan with no LIMIT is fast because it only reads the btree index on apply_url.
  async getExistingApplyUrls(): Promise<Set<string>> {
    const rows = await db
      .select({ applyUrl: aggregatedJobs.applyUrl })
      .from(aggregatedJobs)
      .where(eq(aggregatedJobs.isActive, true));
    const s = new Set<string>();
    for (const r of rows) {
      if (r.applyUrl) s.add(r.applyUrl);
    }
    return s;
  }

  // Returns SQL aggregate stats over the entire table — never loads rows into JS memory.
  async getAggregatedJobStats(provinces: string[], countries: string[], categories: string[]): Promise<{
    totalActive: number;
    urgent: number;
    remote: number;
    aiGenerated: number;
    avgScore: number;
    byProvince: Record<string, number>;
    byCountry: Record<string, number>;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    // Fire all 5 aggregate queries in PARALLEL — no sequential round trips.
    // Measured: sequential ≈ 900ms cold; parallel ≈ 120ms cold on 149k rows.
    const [
      [scalars],
      provinceRows,
      countryRows,
      categoryRows,
      sourceRows,
    ] = await Promise.all([
      db.select({
        totalActive: sql<number>`cast(count(*) as integer)`,
        urgent:      sql<number>`cast(count(*) filter (where ${aggregatedJobs.isUrgent} = true) as integer)`,
        remote:      sql<number>`cast(count(*) filter (where ${aggregatedJobs.isRemote} = true) as integer)`,
        aiGenerated: sql<number>`cast(count(*) filter (where ${aggregatedJobs.agentGenerated} = true) as integer)`,
        avgScore:    sql<number>`cast(round(avg(${aggregatedJobs.aiScore})) as integer)`,
      }).from(aggregatedJobs).where(eq(aggregatedJobs.isActive, true)),

      db.select({
        province: aggregatedJobs.province,
        cnt: sql<number>`cast(count(*) as integer)`,
      })
        .from(aggregatedJobs)
        .where(and(
          eq(aggregatedJobs.isActive, true),
          sql`${aggregatedJobs.province} = ANY(${sql.raw(`ARRAY[${provinces.map(p => `'${p.replace(/'/g, "''")}'`).join(",")}]::text[]`)})`,
        ))
        .groupBy(aggregatedJobs.province),

      db.select({
        country: aggregatedJobs.country,
        cnt: sql<number>`cast(count(*) as integer)`,
      })
        .from(aggregatedJobs)
        .where(and(
          eq(aggregatedJobs.isActive, true),
          sql`${aggregatedJobs.country} = ANY(${sql.raw(`ARRAY[${countries.map(c => `'${c.replace(/'/g, "''")}'`).join(",")}]::text[]`)})`,
        ))
        .groupBy(aggregatedJobs.country),

      db.select({
        category: aggregatedJobs.category,
        cnt: sql<number>`cast(count(*) as integer)`,
      })
        .from(aggregatedJobs)
        .where(and(
          eq(aggregatedJobs.isActive, true),
          sql`${aggregatedJobs.category} = ANY(${sql.raw(`ARRAY[${categories.map(c => `'${c.replace(/'/g, "''")}'`).join(",")}]::text[]`)})`,
        ))
        .groupBy(aggregatedJobs.category),

      db.select({
        source: aggregatedJobs.source,
        cnt: sql<number>`cast(count(*) as integer)`,
      })
        .from(aggregatedJobs)
        .where(eq(aggregatedJobs.isActive, true))
        .groupBy(aggregatedJobs.source)
        .orderBy(sql`count(*) desc`)
        .limit(20),
    ]);

    const byProvince: Record<string, number> = {};
    for (const r of provinceRows) {
      if (r.province) byProvince[r.province] = r.cnt;
    }

    const byCountry: Record<string, number> = {};
    for (const r of countryRows) {
      if (r.country) byCountry[r.country] = r.cnt;
    }

    const byCategory: Record<string, number> = {};
    for (const r of categoryRows) {
      if (r.category && r.cnt > 0) byCategory[r.category] = r.cnt;
    }

    const bySource: Record<string, number> = {};
    for (const r of sourceRows) {
      if (r.source) bySource[r.source] = r.cnt;
    }

    return {
      totalActive: scalars?.totalActive || 0,
      urgent:      scalars?.urgent || 0,
      remote:      scalars?.remote || 0,
      aiGenerated: scalars?.aiGenerated || 0,
      avgScore:    scalars?.avgScore || 0,
      byProvince,
      byCountry,
      byCategory,
      bySource,
    };
  }

  async clearOldAggregatedJobs(): Promise<void> {
    // Delete jobs whose expiresAt has passed (not createdAt — we never delete fresh active jobs)
    const now = new Date();
    await db.delete(aggregatedJobs).where(
      and(
        sql`${aggregatedJobs.expiresAt} IS NOT NULL`,
        sql`${aggregatedJobs.expiresAt} < ${now}`,
      ),
    );
  }

  async deleteAgentGeneratedJobs(): Promise<number> {
    const result = await db.delete(aggregatedJobs)
      .where(eq(aggregatedJobs.agentGenerated, true))
      .returning({ id: aggregatedJobs.id });
    return result.length;
  }

  async getAggregatedJobById(id: string): Promise<AggregatedJob | null> {
    const [job] = await db.select().from(aggregatedJobs).where(eq(aggregatedJobs.id, id)).limit(1);
    return job || null;
  }

  async expireOverdueAggregatedJobs(): Promise<number> {
    const now = new Date();
    const result = await db
      .update(aggregatedJobs)
      .set({ isActive: false })
      .where(
        and(
          eq(aggregatedJobs.isActive, true),
          sql`${aggregatedJobs.expiresAt} IS NOT NULL AND ${aggregatedJobs.expiresAt} < ${now}`,
        ),
      )
      .returning({ id: aggregatedJobs.id });
    return result.length;
  }

  async upgradeStaleAggregatedJobs(): Promise<number> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = await db
      .update(aggregatedJobs)
      .set({
        postedDate: new Date(),
        upgradeCount: sql`COALESCE(${aggregatedJobs.upgradeCount}, 0) + 1`,
      })
      .where(
        and(
          eq(aggregatedJobs.isActive, true),
          sql`${aggregatedJobs.aiScore} >= 80`,
          sql`${aggregatedJobs.postedDate} < ${threeDaysAgo}`,
        ),
      )
      .returning({ id: aggregatedJobs.id });
    return result.length;
  }

  async incrementAggregatedJobView(id: string): Promise<void> {
    await db
      .update(aggregatedJobs)
      .set({ viewCount: sql`COALESCE(${aggregatedJobs.viewCount}, 0) + 1` })
      .where(eq(aggregatedJobs.id, id));
  }

  async incrementAggregatedJobApplication(id: string): Promise<void> {
    await db
      .update(aggregatedJobs)
      .set({ applicationCount: sql`COALESCE(${aggregatedJobs.applicationCount}, 0) + 1` })
      .where(eq(aggregatedJobs.id, id));
  }

  async searchAggregatedJobs(filters?: {
    province?: string;
    country?: string;
    category?: string;
    source?: string;
    jobType?: string;
    experienceLevel?: string;
    isUrgent?: boolean;
    isRemote?: boolean;
    search?: string;
    limit?: number;
    // Cursor pagination: skip rows with ai_score < cursorScore (or equal score but id < cursorId)
    cursorScore?: number;
    cursorId?: string;
  }): Promise<AggregatedJob[]> {
    const conditions = [eq(aggregatedJobs.isActive, true)];

    // ── Location filters ────────────────────────────────────────────────────
    // Uses exact-match equality so the btree indexes on country/province are used.
    if (filters?.country && filters.country !== "all") {
      if (filters.country === "South Africa") {
        // SA: match by province column (9 provinces)
        conditions.push(
          sql`${aggregatedJobs.province} = ANY(ARRAY['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','Free State','North West','Northern Cape']::text[])`,
        );
      } else {
        // International country: exact match (uses idx_agg_country btree index).
        // The route layer handles the remote-fallback logic when this returns <5 results.
        conditions.push(eq(aggregatedJobs.country, filters.country));
      }
    } else if (filters?.province) {
      // SA province drill-down when country=South Africa is not passed explicitly
      conditions.push(eq(aggregatedJobs.province, filters.province));
    }

    // ── Categorical filters (exact equality → uses btree indexes) ────────────
    if (filters?.category) {
      conditions.push(eq(aggregatedJobs.category, filters.category));
    }
    if (filters?.source) {
      conditions.push(eq(aggregatedJobs.liveSource, filters.source));
    }
    if (filters?.jobType) {
      conditions.push(eq(aggregatedJobs.jobType, filters.jobType));
    }
    if (filters?.experienceLevel) {
      conditions.push(eq(aggregatedJobs.experienceLevel, filters.experienceLevel));
    }
    if (filters?.isUrgent) {
      conditions.push(eq(aggregatedJobs.isUrgent, true));
    }
    if (filters?.isRemote) {
      conditions.push(eq(aggregatedJobs.isRemote, true));
    }

    // ── Full-text search — uses GIN tsvector index (idx_agg_fts_gin) ─────────
    // plainto_tsquery handles raw user text (spaces → AND, no injection risk).
    // Falls back to ILIKE on title+company only if query is very short (< 3 chars)
    // to avoid empty tsquery for single-letter inputs.
    if (filters?.search) {
      const q = filters.search.trim();
      if (q.length >= 3) {
        conditions.push(
          sql`to_tsvector('english',
                coalesce(${aggregatedJobs.title},'') || ' ' ||
                coalesce(${aggregatedJobs.company},'') || ' ' ||
                coalesce(${aggregatedJobs.skills},'')
              ) @@ plainto_tsquery('english', ${q})`,
        );
      } else {
        // Short query: exact prefix match on title only (fast with partial index)
        conditions.push(
          sql`(${aggregatedJobs.title} ILIKE ${q + "%"} OR ${aggregatedJobs.company} ILIKE ${q + "%"})`,
        );
      }
    }

    // ── Cursor-based pagination ──────────────────────────────────────────────
    // Client passes cursorScore + cursorId from the last item in the previous page.
    // This lets us skip sorting 100k rows for page N > 1.
    if (filters?.cursorScore !== undefined && filters?.cursorId) {
      conditions.push(
        sql`(${aggregatedJobs.aiScore} < ${filters.cursorScore}
             OR (${aggregatedJobs.aiScore} = ${filters.cursorScore}
                 AND ${aggregatedJobs.id} < ${filters.cursorId}))`,
      );
    }

    return db.select().from(aggregatedJobs)
      .where(and(...conditions))
      .orderBy(desc(aggregatedJobs.aiScore), desc(aggregatedJobs.postedDate))
      .limit(filters?.limit || 200);
  }

  // Job application operations
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [created] = await db.insert(jobApplications).values(application).returning();
    return created;
  }

  async getUserApplications(userId: string): Promise<JobApplication[]> {
    return db.select().from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.appliedAt));
  }

  async getJobApplicants(jobId: string): Promise<Array<JobApplication & { freelancerName: string; freelancerEmail: string | null; profileTitle: string | null; profileBio: string | null; profilePhotoUrl: string | null; hourlyRate: number | null; rating: number | null; completedJobs: number }>> {
    const rows = await db
      .select({
        id: jobApplications.id,
        userId: jobApplications.userId,
        jobId: jobApplications.jobId,
        aggregatedJobId: jobApplications.aggregatedJobId,
        jobTitle: jobApplications.jobTitle,
        company: jobApplications.company,
        location: jobApplications.location,
        coverLetter: jobApplications.coverLetter,
        aiCoverLetter: jobApplications.aiCoverLetter,
        resumeSummary: jobApplications.resumeSummary,
        employabilityScore: jobApplications.employabilityScore,
        status: jobApplications.status,
        notes: jobApplications.notes,
        interviewDate: jobApplications.interviewDate,
        source: jobApplications.source,
        applyUrl: jobApplications.applyUrl,
        appliedAt: jobApplications.appliedAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        profileTitle: profiles.title,
        profileBio: profiles.bio,
        profilePhotoUrl: profiles.photoUrl,
        hourlyRate: profiles.hourlyRate,
        rating: profiles.rating,
        completedJobs: profiles.completedJobs,
      })
      .from(jobApplications)
      .leftJoin(users, eq(users.id, jobApplications.userId))
      .leftJoin(profiles, eq(profiles.userId, jobApplications.userId))
      .where(eq(jobApplications.jobId, jobId))
      .orderBy(desc(jobApplications.appliedAt));

    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      jobId: r.jobId,
      aggregatedJobId: r.aggregatedJobId,
      jobTitle: r.jobTitle,
      company: r.company,
      location: r.location,
      coverLetter: r.coverLetter,
      aiCoverLetter: r.aiCoverLetter,
      resumeSummary: r.resumeSummary,
      employabilityScore: r.employabilityScore,
      status: r.status,
      notes: r.notes,
      interviewDate: r.interviewDate,
      source: r.source,
      applyUrl: r.applyUrl,
      appliedAt: r.appliedAt,
      freelancerName: [r.userFirstName, r.userLastName].filter(Boolean).join(" ") || r.profileTitle || r.userEmail || "Unknown Freelancer",
      freelancerEmail: r.userEmail,
      profileTitle: r.profileTitle,
      profileBio: r.profileBio,
      profilePhotoUrl: r.profilePhotoUrl,
      hourlyRate: r.hourlyRate,
      rating: r.rating,
      completedJobs: r.completedJobs ?? 0,
    }));
  }

  async updateJobApplication(id: string, updates: Partial<Pick<JobApplication, "status" | "notes" | "aiCoverLetter" | "employabilityScore" | "interviewDate">>): Promise<JobApplication | undefined> {
    const [updated] = await db.update(jobApplications)
      .set(updates)
      .where(eq(jobApplications.id, id))
      .returning();
    return updated;
  }

  async createBusinessInvitation(invitation: InsertBusinessInvitation): Promise<BusinessInvitation> {
    const [created] = await db.insert(businessInvitations).values(invitation).returning();
    return created;
  }

  async createManyBusinessInvitations(invitations: InsertBusinessInvitation[]): Promise<BusinessInvitation[]> {
    if (invitations.length === 0) return [];
    return db.insert(businessInvitations).values(invitations).returning();
  }

  async getBusinessInvitation(id: string): Promise<BusinessInvitation | undefined> {
    const [inv] = await db.select().from(businessInvitations).where(eq(businessInvitations.id, id));
    return inv;
  }

  async getBusinessInvitationByCode(code: string): Promise<BusinessInvitation | undefined> {
    const [inv] = await db.select().from(businessInvitations).where(eq(businessInvitations.inviteCode, code));
    return inv;
  }

  async claimBusinessInvitation(code: string, userId: string): Promise<BusinessInvitation | undefined> {
    const [updated] = await db.update(businessInvitations)
      .set({ status: "claimed", claimedByUserId: userId })
      .where(and(eq(businessInvitations.inviteCode, code), eq(businessInvitations.status, "pending")))
      .returning();
    return updated;
  }

  async getAllBusinessInvitations(filters?: { province?: string; category?: string; status?: string }): Promise<BusinessInvitation[]> {
    const conditions: any[] = [];
    if (filters?.province) conditions.push(eq(businessInvitations.province, filters.province));
    if (filters?.category) conditions.push(eq(businessInvitations.category, filters.category));
    if (filters?.status) conditions.push(eq(businessInvitations.status, filters.status));

    if (conditions.length === 0) {
      return db.select().from(businessInvitations).orderBy(desc(businessInvitations.createdAt)).limit(200);
    }
    return db.select().from(businessInvitations)
      .where(and(...conditions))
      .orderBy(desc(businessInvitations.createdAt))
      .limit(200);
  }

  async getBusinessInvitationStats(): Promise<{ total: number; pending: number; claimed: number }> {
    const totalResult = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(businessInvitations);
    const pendingResult = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(businessInvitations).where(eq(businessInvitations.status, "pending"));
    const claimedResult = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(businessInvitations).where(eq(businessInvitations.status, "claimed"));
    return {
      total: totalResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0,
      claimed: claimedResult[0]?.count || 0,
    };
  }

  async searchBusinessInvitations(query: string): Promise<BusinessInvitation[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db.select().from(businessInvitations)
      .where(or(
        sql`lower(${businessInvitations.businessName}) like ${searchTerm}`,
        sql`lower(${businessInvitations.contactEmail}) like ${searchTerm}`,
        sql`lower(${businessInvitations.city}) like ${searchTerm}`
      ))
      .orderBy(desc(businessInvitations.createdAt))
      .limit(50);
  }

  async getGlobalStats(): Promise<{ jobs: number; profiles: number; bookings: number; messages: number }> {
    const [jobsCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(jobs);
    const [profilesCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(profiles);
    const [bookingsCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(bookings);
    const [messagesCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(messages);

    return {
      jobs: jobsCount?.count || 0,
      profiles: profilesCount?.count || 0,
      bookings: bookingsCount?.count || 0,
      messages: messagesCount?.count || 0,
    };
  }

  // Referral operations
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db.insert(referrals).values(referral).returning();
    return newReferral;
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.referralCode, code));
    return referral;
  }

  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  }

  async getReferralsByUser(userId: string): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async getReferralByReferrer(referrerId: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.referrerId, referrerId)).limit(1);
    return referral;
  }

  async updateReferralStatus(id: number, status: string, referredUserId?: string): Promise<Referral | undefined> {
    const updateData: any = { status };
    if (referredUserId) updateData.referredUserId = referredUserId;
    
    const [updated] = await db.update(referrals)
      .set(updateData)
      .where(eq(referrals.id, id))
      .returning();
    return updated;
  }

  async getReferralStats(userId: string): Promise<{ 
    totalReferred: number; 
    totalEarned: number; 
    pendingRewards: number; 
    tier: string;
    referralCode?: string;
  }> {
    const userReferrals = await this.getReferralsByReferrer(userId);
    const referralCode = userReferrals[0]?.referralCode;

    const totalReferred = userReferrals.filter(r => r.status !== "pending").length;
    const totalEarned = userReferrals
      .filter(r => r.status === "paid")
      .reduce((sum, r) => sum + r.rewardAmount, 0);
    const pendingRewards = userReferrals
      .filter(r => r.status === "completed")
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    let tier = "bronze";
    if (totalReferred >= 50) tier = "platinum";
    else if (totalReferred >= 16) tier = "gold";
    else if (totalReferred >= 6) tier = "silver";

    return {
      totalReferred,
      totalEarned,
      pendingRewards,
      tier,
      referralCode,
    };
  }

  // Academy operations
  async getCourses(): Promise<Course[]> {
    return db.select().from(courses);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCourseLessons(courseId: number): Promise<Lesson[]> {
    return db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.orderIndex);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async getCourseProgress(userId: string, courseId: number): Promise<CourseProgress[]> {
    return db.select().from(courseProgress).where(and(eq(courseProgress.userId, userId), eq(courseProgress.courseId, courseId)));
  }

  async markLessonComplete(userId: string, courseId: number, lessonId: number): Promise<CourseProgress> {
    const existing = await db.select().from(courseProgress).where(and(
      eq(courseProgress.userId, userId),
      eq(courseProgress.lessonId, lessonId)
    ));

    if (existing.length > 0) {
      const [updated] = await db.update(courseProgress)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(courseProgress.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(courseProgress).values({
      userId,
      courseId,
      lessonId,
      completed: true,
      completedAt: new Date(),
    }).returning();
    return created;
  }

  async getCertificate(userId: string, courseId: number): Promise<Certificate | undefined> {
    const [cert] = await db.select().from(certificates).where(and(
      eq(certificates.userId, userId),
      eq(certificates.courseId, courseId)
    ));
    return cert;
  }

  async issueCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const [created] = await db.insert(certificates).values(certificate).returning();
    return created;
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return db.select().from(certificates).where(eq(certificates.userId, userId));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [created] = await db.insert(courses).values(course).returning();
    return created;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [created] = await db.insert(lessons).values(lesson).returning();
    return created;
  }

  // Account operations
  async exportUserData(userId: string): Promise<any> {
    const profile = await this.getProfile(userId);
    const jobsList = await db.select().from(jobs).where(eq(jobs.clientId, userId));
    const bookingsList = await this.getUserBookings(userId);
    const reviewsList = await db.select().from(reviews).where(or(eq(reviews.reviewerId, userId), eq(reviews.revieweeId, userId)));
    const conversationsList = await this.getUserConversations(userId);
    const messagesList = await db.select().from(messages).where(eq(messages.senderId, userId));
    const referralsList = await this.getReferralsByReferrer(userId);

    return {
      profile,
      jobs: jobsList,
      bookings: bookingsList,
      reviews: reviewsList,
      conversations: conversationsList,
      messages: messagesList,
      referrals: referralsList
    };
  }

  async deleteUserAccount(userId: string): Promise<void> {
    await db.update(escrowTransactions)
      .set({ status: "frozen" })
      .where(and(
        or(
          eq(escrowTransactions.freelancerId, userId),
          eq(escrowTransactions.clientId, userId)
        ),
        eq(escrowTransactions.status, "held")
      ));

    await db.update(bookings)
      .set({ status: "suspended" })
      .where(and(
        or(
          eq(bookings.freelancerId, userId),
          eq(bookings.clientId, userId)
        ),
        sql`${bookings.status} IN ('pending', 'confirmed', 'in_progress', 'delivered')`
      ));

    await db.update(profiles)
      .set({ 
        title: "Deleted User", 
        bio: "This account has been deleted.",
        location: "Unknown",
        hourlyRate: null,
        updatedAt: new Date() 
      })
      .where(eq(profiles.userId, userId));
    
    await db.update(messages)
      .set({ content: "[Message removed - Account deleted]" })
      .where(eq(messages.senderId, userId));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    // High-priority types (application_status, payment) always bypass the daily
    // cap — silently dropping an interview invite or payout confirmation is unacceptable.
    const isHighPriority = HIGH_PRIORITY_NOTIFICATION_TYPES.has(notification.type);

    if (!isHighPriority) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const [countResult] = await db.select({ count: count() })
        .from(notifications)
        .where(and(
          eq(notifications.userId, notification.userId),
          sql`${notifications.createdAt} >= ${todayStart}`
        ));
      if (countResult && countResult.count >= 10) {
        const [existing] = await db.select().from(notifications)
          .where(eq(notifications.userId, notification.userId))
          .orderBy(desc(notifications.createdAt))
          .limit(1);
        return existing;
      }
    }

    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markAsRead(id: number): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.count || 0;
  }

  // Fraud operations
  async createFraudFlag(flag: InsertFraudFlag): Promise<FraudFlag> {
    const [newFlag] = await db.insert(fraudFlags).values(flag as any).returning();
    return newFlag;
  }

  async getFraudFlag(id: number): Promise<FraudFlag | undefined> {
    const [flag] = await db.select().from(fraudFlags).where(eq(fraudFlags.id, id));
    return flag;
  }

  async getFraudFlagsByBooking(bookingId: string): Promise<FraudFlag[]> {
    return db.select().from(fraudFlags).where(eq(fraudFlags.bookingId, bookingId));
  }

  async getUnresolvedFraudFlags(): Promise<FraudFlag[]> {
    return db.select().from(fraudFlags).where(sql`${fraudFlags.resolvedAt} IS NULL`).orderBy(desc(fraudFlags.createdAt));
  }

  async resolveFraudFlag(id: number, resolution: string, resolvedBy: string): Promise<FraudFlag | undefined> {
    const [updated] = await db.update(fraudFlags)
      .set({ 
        resolution, 
        resolvedBy, 
        resolvedAt: new Date() 
      })
      .where(eq(fraudFlags.id, id))
      .returning();
    return updated;
  }

  async createAuditLog(logData: Partial<InsertAuditLog>): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values({
      action: logData.action || "unknown",
      resource: logData.resource || "unknown",
      userId: logData.userId || null,
      resourceId: logData.resourceId || null,
      metadata: logData.metadata || null,
      ipAddress: logData.ipAddress || null,
      userAgent: logData.userAgent || null,
    }).returning();
    return created;
  }

  async getAuditLogs(filters?: { userId?: string; action?: string; resource?: string; limit?: number }): Promise<AuditLog[]> {
    const conditions: any[] = [];
    if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
    if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters?.resource) conditions.push(eq(auditLogs.resource, filters.resource));

    if (conditions.length === 0) {
      return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(filters?.limit || 100);
    }
    return db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.createdAt)).limit(filters?.limit || 100);
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [created] = await db.insert(disputes).values(dispute).returning();
    return created;
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    const [d] = await db.select().from(disputes).where(eq(disputes.id, id));
    return d;
  }

  async getDisputesByUser(userId: string): Promise<Dispute[]> {
    return db.select().from(disputes)
      .where(or(eq(disputes.initiatorId, userId), eq(disputes.respondentId, userId)))
      .orderBy(desc(disputes.createdAt));
  }

  async getAllDisputes(status?: string): Promise<Dispute[]> {
    if (status) {
      return db.select().from(disputes).where(eq(disputes.status, status)).orderBy(desc(disputes.createdAt));
    }
    return db.select().from(disputes).orderBy(desc(disputes.createdAt));
  }

  async resolveDispute(id: number, adminId: string, resolution: string): Promise<Dispute | undefined> {
    const [updated] = await db.update(disputes)
      .set({ status: "resolved", adminId, resolution, resolvedAt: new Date() })
      .where(eq(disputes.id, id))
      .returning();
    return updated;
  }

  async createEscrowTransaction(tx: InsertEscrowTransaction): Promise<EscrowTransaction> {
    const [created] = await db.insert(escrowTransactions).values(tx).returning();
    return created;
  }

  async getEscrowByBooking(bookingId: string): Promise<EscrowTransaction | undefined> {
    const [tx] = await db.select().from(escrowTransactions).where(eq(escrowTransactions.bookingId, bookingId));
    return tx;
  }

  async updateEscrowStatus(id: number, status: string): Promise<EscrowTransaction | undefined> {
    const updates: any = { status };
    if (status === "released") updates.releasedAt = new Date();
    if (status === "refunded") updates.refundedAt = new Date();
    const [updated] = await db.update(escrowTransactions).set(updates).where(eq(escrowTransactions.id, id)).returning();
    return updated;
  }

  async getEscrowStats(): Promise<{ held: number; released: number; refunded: number }> {
    const [held] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)::int` }).from(escrowTransactions).where(eq(escrowTransactions.status, "held"));
    const [released] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)::int` }).from(escrowTransactions).where(eq(escrowTransactions.status, "released"));
    const [refunded] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)::int` }).from(escrowTransactions).where(eq(escrowTransactions.status, "refunded"));
    return { held: held?.total || 0, released: released?.total || 0, refunded: refunded?.total || 0 };
  }

  async getPremiumTier(userId: string): Promise<PremiumTier | undefined> {
    const [tier] = await db.select().from(premiumTiers).where(eq(premiumTiers.userId, userId));
    return tier;
  }

  async upsertPremiumTier(tier: InsertPremiumTier): Promise<PremiumTier> {
    const existing = await this.getPremiumTier(tier.userId);
    if (existing) {
      const [updated] = await db.update(premiumTiers)
        .set({ ...tier, updatedAt: new Date() })
        .where(eq(premiumTiers.userId, tier.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(premiumTiers).values(tier).returning();
    return created;
  }

  async query(sqlStr: string, params?: any[]): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(sqlStr, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

export const storage = new DatabaseStorage();
