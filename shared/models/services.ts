import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, real, timestamp, boolean, time, date, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { bookingStatusEnum } from "./enums";

export const servicePackages = pgTable("service_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  freelancerId: varchar("freelancer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  duration: text("duration"),
  isActive: boolean("is_active").notNull().default(true),
  isPromoted: boolean("is_promoted").notNull().default(false),
  promotedBid: integer("promoted_bid").default(0),
  bookingCount: integer("booking_count").notNull().default(0),
  // Activity tracking (Command 15)
  viewCount: integer("view_count").notNull().default(0),
  conversionRate: real("conversion_rate").notNull().default(0), // orders_90d / views_90d, 0.0 if < 10 views
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    freelancerId: varchar("freelancer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
  },
  (table) => [
    unique("uq_availability_slots_freelancer_day_time").on(table.freelancerId, table.dayOfWeek, table.startTime),
    index("idx_availability_slots_freelancer").on(table.freelancerId),
  ]
);

export const bookings = pgTable(
  "bookings",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: varchar("client_id").notNull().references(() => users.id),
    freelancerId: varchar("freelancer_id").notNull().references(() => users.id),
    servicePackageId: varchar("service_package_id").references(() => servicePackages.id),
    jobId: varchar("job_id"),
    bookingDate: date("booking_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time"),
    status: bookingStatusEnum("status").notNull().default("pending"),
    totalAmount: integer("total_amount").notNull(),
    location: text("location"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_bookings_client").on(table.clientId),
    index("idx_bookings_freelancer").on(table.freelancerId),
    index("idx_bookings_status").on(table.status),
  ]
);

// reviews: for service-package bookings (distinct from bid_reviews in marketplace.ts which covers job bids)
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerified: boolean("is_verified").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({
  id: true,
  createdAt: true,
  bookingCount: true,
  isPromoted: true,
  promotedBid: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  isVerified: true,
});

export const businessInvitations = pgTable("business_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  category: text("category").notNull(),
  province: text("province").notNull(),
  city: text("city").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  websiteUrl: text("website_url"),
  inviteCode: varchar("invite_code").notNull().unique(),
  status: text("status").notNull().default("pending"),
  claimedByUserId: varchar("claimed_by_user_id").references(() => users.id),
  sentVia: text("sent_via"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBusinessInvitationSchema = createInsertSchema(businessInvitations).omit({
  id: true,
  createdAt: true,
  status: true,
  claimedByUserId: true,
});

export const portfolioImages = pgTable(
  "portfolio_images",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    cloudinaryPublicId: varchar("cloudinary_public_id"),
    url: text("url").notNull(),
    caption: text("caption"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_portfolio_images_user").on(table.userId),
  ]
);

export const insertPortfolioImageSchema = createInsertSchema(portfolioImages).omit({
  id: true,
  createdAt: true,
});

export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type BusinessInvitation = typeof businessInvitations.$inferSelect;
export type InsertBusinessInvitation = z.infer<typeof insertBusinessInvitationSchema>;
export type PortfolioImage = typeof portfolioImages.$inferSelect;
export type InsertPortfolioImage = z.infer<typeof insertPortfolioImageSchema>;
