import { 
  type Job, type InsertJob, type Profile, type InsertProfile, 
  type ServicePackage, type InsertServicePackage, type Booking, type InsertBooking,
  type Review, type InsertReview, type Conversation, type Message, type InsertMessage,
  type InsertEnterpriseLead, type EnterpriseLead,
  type AggregatedJob, type InsertAggregatedJob, type JobApplication, type InsertJobApplication,
  type BusinessInvitation, type InsertBusinessInvitation,
  jobs, profiles, servicePackages, bookings, reviews, conversations, messages,
  freelancerVerifications, privateFeedback, enterpriseLeads, aggregatedJobs, jobApplications,
  businessInvitations
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, sql, desc } from "drizzle-orm";

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
  searchFreelancers(query?: string, location?: string): Promise<Profile[]>;

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
  
  // Messaging operations
  getConversation(id: string): Promise<Conversation | undefined>;
  getOrCreateConversation(user1Id: string, user2Id: string, jobId?: string): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  
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
  clearOldAggregatedJobs(): Promise<void>;

  // Job application operations
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getUserApplications(userId: string): Promise<JobApplication[]>;

  // Business invitation operations
  createBusinessInvitation(invitation: InsertBusinessInvitation): Promise<BusinessInvitation>;
  createManyBusinessInvitations(invitations: InsertBusinessInvitation[]): Promise<BusinessInvitation[]>;
  getBusinessInvitation(id: string): Promise<BusinessInvitation | undefined>;
  getBusinessInvitationByCode(code: string): Promise<BusinessInvitation | undefined>;
  claimBusinessInvitation(code: string, userId: string): Promise<BusinessInvitation | undefined>;
  getAllBusinessInvitations(filters?: { province?: string; category?: string; status?: string }): Promise<BusinessInvitation[]>;
  getBusinessInvitationStats(): Promise<{ total: number; pending: number; claimed: number }>;
  searchBusinessInvitations(query: string): Promise<BusinessInvitation[]>;
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

  async searchFreelancers(query?: string, location?: string): Promise<Profile[]> {
    let conditions = [eq(profiles.userType, "freelancer")];
    
    if (location) {
      conditions.push(sql`${profiles.location} ILIKE ${'%' + location + '%'}`);
    }
    
    return db.select().from(profiles).where(and(...conditions));
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

  async clearOldAggregatedJobs(): Promise<void> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    await db.delete(aggregatedJobs).where(sql`${aggregatedJobs.createdAt} < ${threeDaysAgo}`);
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
}

export const storage = new DatabaseStorage();
