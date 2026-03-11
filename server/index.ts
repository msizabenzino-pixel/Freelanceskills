import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupSocket } from "./socket";

const app = express();
const httpServer = createServer(app);
const io = setupSocket(httpServer);

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

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10mb" }));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=(self)");
  const isDev = process.env.NODE_ENV !== "production";
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    `connect-src 'self' https: ${isDev ? "ws: wss:" : "wss:"}; ` +
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com; " +
    "frame-ancestors 'self' https://*.replit.dev https://*.replit.app;"
  );
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitMap.keys()).forEach(key => {
    const entry = rateLimitMap.get(key);
    if (entry && now > entry.resetTime) rateLimitMap.delete(key);
  });
}, 60000);

// Specific rate limit for AI endpoints to prevent abuse and manage costs
const aiRateLimitMap = new Map<string, { count: number; resetTime: number }>();
app.use("/api/ai", (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 3600000; // 1 hour window
  const maxRequests = 60; // 60 AI requests per hour per IP (many endpoints are lightweight)

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

// Specific rate limit for other expensive endpoints
app.use(["/api/cv/parse", "/api/opportunities/search"], (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
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

app.use("/api/", (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 100;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  entry.count++;
  if (entry.count > maxRequests) {
    res.setHeader("Retry-After", Math.ceil((entry.resetTime - now) / 1000).toString());
    return res.status(429).json({ message: "Too many requests. Please try again shortly." });
  }

  next();
});

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
        // We could add capturedJsonResponse to logExtra too, but it might be too large
      }

      log(logLine, "express", logExtra);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
