import { sql } from "drizzle-orm";
import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const enterpriseLeads = pgTable("enterprise_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companySize: text("company_size"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEnterpriseLeadSchema = createInsertSchema(enterpriseLeads).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertEnterpriseLead = z.infer<typeof insertEnterpriseLeadSchema>;
export type EnterpriseLead = typeof enterpriseLeads.$inferSelect;
