import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,

  // Connection pool sizing
  // 20 max prevents exhausting Replit Postgres (which allows ~100 connections).
  // 2 min keeps warm connections ready without wasting resources at idle.
  max: 20,
  min: 2,

  // How long (ms) a client must sit idle before being released from the pool.
  idleTimeoutMillis: 30_000,

  // How long (ms) to wait for a connection from the pool before erroring.
  // Surfaces "pool exhausted" clearly instead of hanging indefinitely.
  connectionTimeoutMillis: 8_000,

  // Maximum lifetime for any single connection (ms). Prevents stale connections.
  maxLifetimeSeconds: 1800,

  // Allow SSL in production but not locally (Replit DATABASE_URL may or may not have it).
  ssl: process.env.DATABASE_URL?.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
});

// Log pool errors so they don't become silent connection leaks
pool.on("error", (err: Error) => {
  console.error("[db] Pool client error:", err.message);
});

export const db = drizzle(pool, { schema });
