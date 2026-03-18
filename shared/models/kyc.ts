import { sql } from "drizzle-orm";
import { pgTable, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// KYC document uploads — stored per user, reviewed by admins
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // "id_document" | "selfie" | "proof_of_address"
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(), // local path or CDN URL
  mimeType: varchar("mime_type", { length: 100 }),
  fileSizeBytes: integer("file_size_bytes"),
  status: varchar("status", { length: 30 }).notNull().default("pending"), // "pending" | "approved" | "rejected"
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
  id: true,
  uploadedAt: true,
  reviewedAt: true,
});

export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;
