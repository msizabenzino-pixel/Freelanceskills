import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  // auto-detect HTTPS so cookies work on both Replit dev (HTTP) and production (HTTPS)
  // replit.dev = HTTP (insecure), replit.app = HTTPS (secure)
  const isSecure = (process.env.REPLIT_DOMAINS || "").includes("replit.app") ||
    (!(process.env.REPLIT_DOMAINS || "").includes("replit.dev") &&
     process.env.NODE_ENV === "production");
  return session({
    secret: process.env.SESSION_SECRET || "freelanceskills-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if ((req.session as any)?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
