import { pgTable, text, integer, timestamp, varchar, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const blockchainCredentials = pgTable("blockchain_credentials", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  credentialType: varchar("credential_type").notNull(),
  issuer: varchar("issuer").notNull(),
  hash: varchar("hash").notNull(),
  status: varchar("status").notNull().default("pending"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nftBadges = pgTable("nft_badges", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  tokenId: varchar("token_id").notNull(),
  contractAddress: varchar("contract_address").notNull(),
  txHash: varchar("tx_hash").notNull(),
  badgeName: varchar("badge_name").notNull(),
  imageUrl: text("image_url"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  mintedAt: timestamp("minted_at").defaultNow().notNull(),
});

export const greenImpactScores = pgTable("green_impact_scores", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  jobId: integer("job_id"),
  carbonKgs: real("carbon_kgs").notNull(),
  impactType: varchar("impact_type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityForumPosts = pgTable("community_forum_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  category: varchar("category").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  views: integer("views").notNull().default(0),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityForumReplies = pgTable("community_forum_replies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  isAcceptedSolution: boolean("is_accepted_solution").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const daoProposals = pgTable("dao_proposals", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  creatorId: varchar("creator_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  status: varchar("status").notNull().default("active"),
  minVotesRequired: integer("min_votes_required").notNull().default(10),
  deadline: timestamp("deadline").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const daoVotes = pgTable("dao_votes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  proposalId: integer("proposal_id").notNull(),
  voterId: varchar("voter_id").notNull(),
  vote: boolean("vote").notNull(),
  power: integer("power").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiContracts = pgTable("ai_contracts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id").notNull(),
  freelancerId: varchar("freelancer_id").notNull(),
  clientId: varchar("client_id").notNull(),
  contractText: text("contract_text").notNull(),
  aiMetadata: jsonb("ai_metadata").$type<Record<string, any>>(),
  status: varchar("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wellnessLogs = pgTable("wellness_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  logType: varchar("log_type").notNull(),
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mentorMatches = pgTable("mentor_matches", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  mentorId: varchar("mentor_id").notNull(),
  menteeId: varchar("mentee_id").notNull(),
  status: varchar("status").notNull().default("active"),
  aiMatchScore: real("ai_match_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlockchainCredentialSchema = createInsertSchema(blockchainCredentials).omit({ id: true, createdAt: true });
export const insertNftBadgeSchema = createInsertSchema(nftBadges).omit({ id: true, mintedAt: true });
export const insertGreenImpactScoreSchema = createInsertSchema(greenImpactScores).omit({ id: true, createdAt: true });
export const insertCommunityForumPostSchema = createInsertSchema(communityForumPosts).omit({ id: true, createdAt: true });
export const insertCommunityForumReplySchema = createInsertSchema(communityForumReplies).omit({ id: true, createdAt: true });
export const insertDaoProposalSchema = createInsertSchema(daoProposals).omit({ id: true, createdAt: true });
export const insertDaoVoteSchema = createInsertSchema(daoVotes).omit({ id: true, createdAt: true });
export const insertAiContractSchema = createInsertSchema(aiContracts).omit({ id: true, createdAt: true });
export const insertWellnessLogSchema = createInsertSchema(wellnessLogs).omit({ id: true, createdAt: true });
export const insertMentorMatchSchema = createInsertSchema(mentorMatches).omit({ id: true, createdAt: true });

export type BlockchainCredential = typeof blockchainCredentials.$inferSelect;
export type InsertBlockchainCredential = z.infer<typeof insertBlockchainCredentialSchema>;
export type NftBadge = typeof nftBadges.$inferSelect;
export type InsertNftBadge = z.infer<typeof insertNftBadgeSchema>;
export type GreenImpactScore = typeof greenImpactScores.$inferSelect;
export type InsertGreenImpactScore = z.infer<typeof insertGreenImpactScoreSchema>;
export type CommunityForumPost = typeof communityForumPosts.$inferSelect;
export type InsertCommunityForumPost = z.infer<typeof insertCommunityForumPostSchema>;
export type CommunityForumReply = typeof communityForumReplies.$inferSelect;
export type InsertCommunityForumReply = z.infer<typeof insertCommunityForumReplySchema>;
export type DaoProposal = typeof daoProposals.$inferSelect;
export type InsertDaoProposal = z.infer<typeof insertDaoProposalSchema>;
export type DaoVote = typeof daoVotes.$inferSelect;
export type InsertDaoVote = z.infer<typeof insertDaoVoteSchema>;
export type AiContract = typeof aiContracts.$inferSelect;
export type InsertAiContract = z.infer<typeof insertAiContractSchema>;
export type WellnessLog = typeof wellnessLogs.$inferSelect;
export type InsertWellnessLog = z.infer<typeof insertWellnessLogSchema>;
export type MentorMatch = typeof mentorMatches.$inferSelect;
export type InsertMentorMatch = z.infer<typeof insertMentorMatchSchema>;
