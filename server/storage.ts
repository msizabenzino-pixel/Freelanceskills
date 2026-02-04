import { 
  type Job, type InsertJob, type Profile, type InsertProfile, 
  type ServicePackage, type InsertServicePackage, type Booking, type InsertBooking,
  type Review, type InsertReview, type Conversation, type Message, type InsertMessage,
  jobs, profiles, servicePackages, bookings, reviews, conversations, messages
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
}

export const storage = new DatabaseStorage();
