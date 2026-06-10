import { pgEnum } from "drizzle-orm/pg-core";

export const jobStatusEnum = pgEnum("job_status", [
  "open", "hired", "in_progress", "delivered", "completed", "cancelled",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "applied", "reviewing", "shortlisted", "interview", "offered",
  "accepted", "rejected", "withdrawn",
]);

export const bidStatusEnum = pgEnum("bid_status", [
  "pending", "accepted", "rejected", "withdrawn",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "job_match", "message", "payment", "system", "application_status",
  "review", "booking", "referral",
]);

export const userTypeEnum = pgEnum("user_type", [
  "client", "freelancer", "both",
]);

export const profileRoleEnum = pgEnum("profile_role", [
  "client", "freelancer", "admin", "moderator", "upskiller",
]);

export const kycStatusEnum = pgEnum("kyc_status_enum", [
  "not_started", "pending", "verified", "rejected",
]);

export const profileStatusEnum = pgEnum("profile_status", [
  "active", "suspended", "banned", "pending",
]);

export const urgencyEnum = pgEnum("urgency", [
  "normal", "urgent",
]);

export const locationTypeEnum = pgEnum("location_type", [
  "onsite", "remote", "hybrid",
]);

export const escrowStatusEnum = pgEnum("escrow_status", [
  "held", "released", "refunded", "disputed", "auto_released",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "open", "under_review", "resolved", "closed", "escalated",
]);

export const disputePriorityEnum = pgEnum("dispute_priority", [
  "low", "medium", "high", "critical",
]);

export const disputeReasonEnum = pgEnum("dispute_reason", [
  "quality", "payment", "timeline", "communication", "theft", "other",
]);

export const gigStatusEnum = pgEnum("gig_status", [
  "draft", "pending_approval", "active", "paused", "suspended",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", "confirmed", "completed", "cancelled",
]);
