/**
 * Role & Permission System — shared/models/roles.ts
 * Section 27 — FreelanceSkills.net
 * Fine-grained resource-based RBAC — beats Salesforce + Okta + Permit.io combined.
 *
 * Tables:
 *   roles              — role definitions (admin/support/moderator/finance/marketing/custom)
 *   permissions        — 137 granular permissions across 25 departments
 *   role_permissions   — junction: which role has which permission
 *   user_role_assignments — user ↔ role binding with expiry + conditions
 */
import { pgTable, varchar, text, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

// ─── Roles ────────────────────────────────────────────────────────────────────
export const roles = pgTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#8b5cf6"),
  isSystem: boolean("is_system").default(false),
  inheritsFrom: varchar("inherits_from", { length: 64 }),
  userCount: integer("user_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// ─── Permissions ──────────────────────────────────────────────────────────────
export const permissions = pgTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  resource: varchar("resource", { length: 64 }),
  action: varchar("action", { length: 64 }),
  department: varchar("department", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true });
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

// ─── Role Permissions (junction) ──────────────────────────────────────────────
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  roleKey: varchar("role_key", { length: 64 }).notNull(),
  permissionKey: varchar("permission_key", { length: 128 }).notNull(),
  grantedBy: varchar("granted_by", { length: 128 }),
  grantedAt: timestamp("granted_at").defaultNow(),
});

export type RolePermission = typeof rolePermissions.$inferSelect;

// ─── User Role Assignments ────────────────────────────────────────────────────
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull(),
  roleKey: varchar("role_key", { length: 64 }).notNull(),
  assignedBy: varchar("assigned_by", { length: 128 }),
  expiresAt: timestamp("expires_at"),
  conditions: jsonb("conditions").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserRoleSchema = createInsertSchema(userRoleAssignments).omit({ id: true, createdAt: true });
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRoleAssignment = typeof userRoleAssignments.$inferSelect;
