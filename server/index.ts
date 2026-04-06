import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupSocket } from "./socket";
import { securityHeaders, corsMiddleware, auditMiddleware, tieredRateLimiter, startCronScheduler, trackMetric } from "./fortify";
import { pool } from "./db";
import { runDbOptimizations } from "./dbOptimize";

const app = express();
app.disable("x-powered-by");
const httpServer = createServer(app);
const io = setupSocket(httpServer);

const SERVER_START_TIME = Date.now();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message, err.stack);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("SIGTERM", () => {
  console.error("Received SIGTERM");
});
process.on("SIGINT", () => {
  console.error("Received SIGINT");
});
process.on("exit", (code) => {
  console.error("Process exit with code:", code);
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ── Gzip compression ──────────────────────────────────────────────────────────
// Compresses all JSON responses. Typically reduces payload size 70–80%.
// Skipped for small responses (<1 KB) automatically by the library.
app.use(compression({
  level: 6,         // Balanced between CPU cost and compression ratio
  threshold: 1024,  // Only compress responses > 1 KB
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
const skipBodyParseForSubmit = (middleware: any) => (req: any, res: any, next: any) => {
  if (req.path === "/api/payfast/submit") return next();
  return middleware(req, res, next);
};

app.use(
  skipBodyParseForSubmit(express.json({
    limit: "2mb",   // Reduced from 10mb — no endpoint needs > 2mb body
    verify: (req: any, _res: any, buf: any) => {
      req.rawBody = buf;
    },
  })),
);

app.use(skipBodyParseForSubmit(express.urlencoded({ extended: false, limit: "2mb" })));

// ── Request timeout guard ─────────────────────────────────────────────────────
// Kill any request that hasn't responded within 25 seconds.
// Prevents slow DB queries from piling up under load.
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip timeout for SSE / WebSocket upgrade requests
  if (req.headers.upgrade) return next();
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      log(`[timeout] ${req.method} ${req.path} took > 25s — aborting`, "warn");
      res.status(503).json({ error: "Request timeout. Please try again." });
    }
  }, 25_000);
  res.on("finish", () => clearTimeout(timeout));
  res.on("close", () => clearTimeout(timeout));
  next();
});

// ── Security middleware ───────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use((req, res, next) => {
  if (req.path === "/api/payfast/submit" || req.path.startsWith("/api/payfast/go/")) {
    return next();
  }
  securityHeaders(req, res, next);
});
app.use(auditMiddleware);

// ── Health check endpoint ─────────────────────────────────────────────────────
// Responds with DB ping, pool stats, and uptime.
// Used by Replit deployment health checks and external monitoring.
app.get("/api/health", async (_req: Request, res: Response) => {
  const uptimeMs = Date.now() - SERVER_START_TIME;
  let dbStatus = "ok";
  let dbLatencyMs = 0;

  try {
    const t0 = Date.now();
    await pool.query("SELECT 1");
    dbLatencyMs = Date.now() - t0;
  } catch {
    dbStatus = "error";
  }

  const poolStats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };

  const status = dbStatus === "ok" ? 200 : 503;
  return res.status(status).json({
    status: dbStatus === "ok" ? "healthy" : "degraded",
    uptime: `${Math.floor(uptimeMs / 1000)}s`,
    db: { status: dbStatus, latencyMs: dbLatencyMs },
    pool: poolStats,
    version: "2.0.0",
    platform: "FreelanceSkills.net",
    timestamp: new Date().toISOString(),
  });
});

// ── Per-route rate limiters ───────────────────────────────────────────────────
const aiRateLimitMap = new Map<string, { count: number; resetTime: number }>();

app.use("/api/ai", (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 3600000;
  const maxRequests = 60;

  const entry = aiRateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    aiRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }
  entry.count++;
  if (entry.count > maxRequests) {
    res.setHeader("Retry-After", Math.ceil((entry.resetTime - now) / 1000).toString());
    return res.status(429).json({ message: "AI rate limit exceeded. Please try again in an hour." });
  }
  next();
});

app.use(["/api/cv/parse", "/api/opportunities/search"], (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 3600000;
  const maxRequests = 5;

  const entry = aiRateLimitMap.get(`${ip}:expensive`);
  if (!entry || now > entry.resetTime) {
    aiRateLimitMap.set(`${ip}:expensive`, { count: 1, resetTime: now + windowMs });
    return next();
  }
  entry.count++;
  if (entry.count > maxRequests) {
    return res.status(429).json({ message: "Request limit exceeded for this feature. Please try again later." });
  }
  next();
});

app.use("/api/", (req: Request, res: Response, next: NextFunction) => {
  const exemptPaths = [
    "/api/health", "/api/metrics", "/api/metrics/prometheus",
    "/api/metrics/dashboard", "/api/stats/public",
    "/api/payfast/itn", "/api/payfast/submit",
  ];
  if (req.path.startsWith("/api/payfast/go/")) return next();
  if (exemptPaths.includes(req.path)) return next();
  return tieredRateLimiter(req, res, next);
});

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of aiRateLimitMap) {
    if (now > entry.resetTime) aiRateLimitMap.delete(key);
  }
}, 60000);

// ── Metrics ───────────────────────────────────────────────────────────────────
export const metrics = {
  totalRequests: 0,
  requestsByPrefix: {} as Record<string, number>,
};

export function log(message: string, source = "express", extra: Record<string, any> = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "info",
    source,
    message,
    ...extra,
  };
  console.log(JSON.stringify(logEntry));
}

app.use((req, res, next) => {
  metrics.totalRequests++;
  trackMetric("httpRequestsTotal");
  const parts = req.path.split("/");
  if (parts.length >= 3 && parts[1] === "api") {
    const prefix = `/api/${parts[2]}`;
    metrics.requestsByPrefix[prefix] = (metrics.requestsByPrefix[prefix] || 0) + 1;
  }

  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    trackMetric("httpRequestDuration", duration);
    if (res.statusCode >= 500) trackMetric("errorsTotal");
    if (path.startsWith("/api")) {
      const logExtra: Record<string, any> = {
        method: req.method,
        path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      };

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine, "express", logExtra);
    }
  });

  next();
});

(async () => {
  // ── Run DB optimizations before accepting traffic ─────────────────────────
  // Creates all performance indexes + ANALYZE — safe to run on every boot.
  await runDbOptimizations();

  await registerRoutes(httpServer, app);

  // ── Centralised error handler ─────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Don't log 4xx client errors as errors — they're expected
    if (status >= 500) {
      console.error("Internal Server Error:", err);
    }

    if (res.headersSent) return next(err);
    return res.status(status).json({ error: message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  startCronScheduler();

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => { log(`serving on port ${port}`); },
  );
})();
