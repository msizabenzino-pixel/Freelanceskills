/**
 * FreelanceSkills — Database Performance Optimization
 * ====================================================
 * Runs once at startup to create all performance-critical indexes.
 * Idempotent: uses CREATE INDEX IF NOT EXISTS — safe to run on every boot.
 *
 * Impact targets:
 *  - aggregated_jobs list/filter: 120ms → <5ms   (B-tree indexes)
 *  - aggregated_jobs full-text search: 200ms → <10ms (GIN tsvector index)
 *  - stats/count queries: 80ms → <3ms             (partial indexes)
 *  - job expiry cron: 90ms → <2ms                 (expires_at index)
 */

import { pool } from "./db";
import { log } from "./logger";

const INDEXES: { name: string; sql: string }[] = [
  // ── Core listing query ────────────────────────────────────────────────────
  // Covers the default ORDER BY (ai_score DESC, posted_date DESC) + is_active filter.
  // Turns the parallel seq-scan into an index-only scan.
  {
    name: "idx_agg_active_score_date",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_active_score_date
          ON aggregated_jobs (is_active, ai_score DESC, posted_date DESC)`,
  },

  // ── Country filter ────────────────────────────────────────────────────────
  // Used by every non-SA country selection. Exact match after the remote-fallback
  // logic resolves, so btree is perfect here.
  {
    name: "idx_agg_country",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_country
          ON aggregated_jobs (country)`,
  },

  // ── Province filter ───────────────────────────────────────────────────────
  // South Africa province drill-down.
  {
    name: "idx_agg_province",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_province
          ON aggregated_jobs (province)`,
  },

  // ── Category filter ───────────────────────────────────────────────────────
  {
    name: "idx_agg_category",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_category
          ON aggregated_jobs (category)`,
  },

  // ── Job type filter ───────────────────────────────────────────────────────
  {
    name: "idx_agg_job_type",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_job_type
          ON aggregated_jobs (job_type)`,
  },

  // ── Experience level filter ───────────────────────────────────────────────
  {
    name: "idx_agg_exp_level",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_exp_level
          ON aggregated_jobs (experience_level)`,
  },

  // ── Remote toggle (partial — only indexes remote=true rows) ───────────────
  // Partial index on the half of rows that are remote — much smaller, much faster.
  {
    name: "idx_agg_remote",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_remote
          ON aggregated_jobs (is_active, ai_score DESC)
          WHERE is_remote = true`,
  },

  // ── Urgent toggle (partial) ───────────────────────────────────────────────
  {
    name: "idx_agg_urgent",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_urgent
          ON aggregated_jobs (is_active, posted_date DESC)
          WHERE is_urgent = true`,
  },

  // ── Source / live_source filter ───────────────────────────────────────────
  {
    name: "idx_agg_live_source",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_live_source
          ON aggregated_jobs (live_source)`,
  },

  // ── Expiry cleanup cron ───────────────────────────────────────────────────
  // Used by the scheduler that marks expired jobs inactive.
  {
    name: "idx_agg_expires_at",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_expires_at
          ON aggregated_jobs (expires_at)
          WHERE is_active = true`,
  },

  // ── Stats / count query ───────────────────────────────────────────────────
  // Covers GROUP BY country + province + is_remote for the stats endpoint.
  {
    name: "idx_agg_stats_cover",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_stats_cover
          ON aggregated_jobs (is_active, country, province, is_remote, is_urgent)`,
  },

  // ── Apply URL dedup (used by live fetcher upsert) ─────────────────────────
  {
    name: "idx_agg_apply_url",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_apply_url
          ON aggregated_jobs (apply_url)`,
  },

  // ── Full-text search — GIN tsvector expression index ──────────────────────
  // Replaces ILIKE '%query%' scans (always full-table) with an indexed FTS lookup.
  // plainto_tsquery handles raw user input safely (no operator injection).
  // Expression matches exactly what searchAggregatedJobs uses in its WHERE clause.
  {
    name: "idx_agg_fts_gin",
    sql: `CREATE INDEX IF NOT EXISTS idx_agg_fts_gin
          ON aggregated_jobs
          USING GIN (
            to_tsvector('english',
              coalesce(title, '') || ' ' ||
              coalesce(company, '') || ' ' ||
              coalesce(skills, '')
            )
          )`,
  },
];

export async function runDbOptimizations(): Promise<void> {
  const client = await pool.connect();
  const t0 = Date.now();
  let created = 0;
  let skipped = 0;

  try {
    for (const idx of INDEXES) {
      try {
        await client.query(idx.sql);
        log(`[dbOptimize] index ready: ${idx.name}`, "db");
        created++;
      } catch (err: any) {
        // Index already exists with different definition — log but continue
        if (err.code === "42P07" || err.message?.includes("already exists")) {
          skipped++;
        } else {
          log(`[dbOptimize] WARNING — could not create ${idx.name}: ${err.message}`, "db");
        }
      }
    }

    // Also ANALYZE the table so the query planner picks up the new indexes immediately.
    await client.query("ANALYZE aggregated_jobs");

    const elapsed = Date.now() - t0;
    log(
      `[dbOptimize] Done in ${elapsed}ms — ${created} indexes ensured, ${skipped} skipped`,
      "db",
    );
  } finally {
    client.release();
  }
}
