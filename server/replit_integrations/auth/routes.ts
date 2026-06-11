import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { mergeSessionActivity } from "../../tracking";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

function getLinkedInCallbackUrl(req: any): string {
  const host = process.env.REPLIT_DOMAINS?.split(",")[0] || req.get("host");
  const proto = host?.includes("replit.app") || host?.includes("replit.dev") ? "https" : req.protocol;
  return `${proto}://${host}/api/auth/linkedin/callback`;
}

export function registerAuthRoutes(app: Express): void {
  // ── LINKEDIN OAUTH 2.0 ─────────────────────────────────────────────────────
  app.get("/api/auth/linkedin", (req: any, res) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
      return res.redirect("/?linkedin_error=not_configured");
    }
    const state = crypto.randomBytes(16).toString("hex");
    (req.session as any).linkedinState = state;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: getLinkedInCallbackUrl(req),
      scope: "openid profile email",
      state,
    });
    res.redirect(`${LINKEDIN_AUTH_URL}?${params.toString()}`);
  });

  app.get("/api/auth/linkedin/callback", async (req: any, res) => {
    try {
      const { code, state, error } = req.query;
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

      if (error) {
        return res.redirect(`/login?auth_error=${encodeURIComponent("LinkedIn sign-in was cancelled.")}`);
      }
      if (!clientId || !clientSecret) {
        return res.redirect("/login?auth_error=" + encodeURIComponent("LinkedIn is not configured. Please contact support."));
      }
      if (state !== (req.session as any).linkedinState) {
        return res.redirect("/login?auth_error=" + encodeURIComponent("Invalid state. Please try again."));
      }
      delete (req.session as any).linkedinState;

      // Exchange code for access token
      const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: String(code),
          redirect_uri: getLinkedInCallbackUrl(req),
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });
      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("[linkedin] Token exchange failed:", err);
        return res.redirect("/login?auth_error=" + encodeURIComponent("LinkedIn authentication failed. Please try again."));
      }
      const tokenData = await tokenRes.json() as any;
      const accessToken = tokenData.access_token;

      // Fetch LinkedIn user info (OIDC)
      const userRes = await fetch(LINKEDIN_USERINFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userRes.ok) {
        return res.redirect("/login?auth_error=" + encodeURIComponent("Could not retrieve your LinkedIn profile. Please try again."));
      }
      const profile = await userRes.json() as any;
      const email = profile.email;
      if (!email) {
        return res.redirect("/login?auth_error=" + encodeURIComponent("Your LinkedIn account does not have a verified email address."));
      }

      // Create or find the user
      const existingUser = await authStorage.getUserByEmail(email);
      let user;
      if (existingUser) {
        user = existingUser;
      } else {
        user = await authStorage.createUser({
          email,
          password: null,
          firstName: profile.given_name || profile.name?.split(" ")[0] || null,
          lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || null,
          profileImageUrl: profile.picture || null,
        });
      }

      (req.session as any).userId = user.id;
      mergeSessionActivity(req.sessionID, user.id).catch(() => {});
      console.log(`[linkedin] User ${email} signed in (id: ${user.id})`);
      res.redirect("/dashboard?linkedin_welcome=1");
    } catch (err) {
      console.error("[linkedin] OAuth callback error:", err);
      res.redirect("/login?auth_error=" + encodeURIComponent("An unexpected error occurred. Please try again."));
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await authStorage.getUserByEmail(email);
      if (!user) {
        // Return 200 even if user not found for security, 
        // but in our mock flow we need to show the link, so let's be explicit for now.
        return res.status(404).json({ message: "User not found" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      await authStorage.createPasswordResetToken(user.id, token, expiresAt);

      // In a real app, we'd email this. Here we return it to display in the UI.
      const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${token}`;
      res.json({ 
        message: "Password reset link generated", 
        resetLink 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const resetToken = await authStorage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await authStorage.updateUserPassword(resetToken.userId, hashedPassword);
      await authStorage.deletePasswordResetToken(token);

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await authStorage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await authStorage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      });

      (req.session as any).userId = user.id;
      mergeSessionActivity(req.sessionID, user.id).catch(() => {});

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await authStorage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      (req.session as any).userId = user.id;
      mergeSessionActivity(req.sessionID, user.id).catch(() => {});

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  // ── FIREBASE SESSION BRIDGE ────────────────────────────────────────────────
  // Verifies a Firebase ID token and synchronises it into the Express session.
  // This bridges Firebase client auth ↔ server-side isAuthenticated middleware.
  app.post("/api/auth/sync-session", async (req: any, res) => {
    try {
      const { uid, idToken } = req.body as { uid?: string; idToken?: string };
      if (!uid || !idToken) {
        return res.status(400).json({ success: false, message: "uid and idToken are required" });
      }

      // Verify the token is genuine using Firebase's lookup REST API.
      // The Web API key is public (embedded in every frontend build).
      const firebaseApiKey =
        process.env.VITE_FIREBASE_API_KEY ||
        process.env.FIREBASE_API_KEY ||
        "AIzaSyDA7jqV7SveOCkfllNsQUC-kThK74n4Syk";

      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        }
      );

      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({})) as any;
        const code = err?.error?.message || "INVALID_TOKEN";
        console.warn("[sync-session] Token verification failed:", code);
        return res.status(401).json({ success: false, message: "Invalid Firebase token", code });
      }

      const data = await verifyRes.json() as any;
      const firebaseUser = data?.users?.[0];
      const verifiedUid: string | undefined = firebaseUser?.localId;
      if (!verifiedUid || verifiedUid !== uid) {
        return res.status(401).json({ success: false, message: "UID mismatch — token not valid for this user" });
      }

      // ── CRITICAL: upsert a users table row for this Firebase UID ────────────
      // profiles.user_id has a FK → users.id. Without this upsert, every
      // Firebase user's first profile save crashes with a FK constraint error.
      try {
        const displayName: string = firebaseUser.displayName || "";
        const spaceIdx = displayName.indexOf(" ");
        const firstName = spaceIdx > 0 ? displayName.slice(0, spaceIdx) : displayName || null;
        const lastName = spaceIdx > 0 ? displayName.slice(spaceIdx + 1) : null;
        await authStorage.upsertUser({
          id: uid,
          email: firebaseUser.email || null,
          firstName,
          lastName,
          profileImageUrl: firebaseUser.photoUrl || null,
        });
      } catch (upsertErr) {
        // Non-fatal — session still works, but log so we can debug if needed
        console.warn("[sync-session] users upsert non-fatal:", upsertErr);
      }

      // Set the server session so isAuthenticated passes for this user.
      (req.session as any).userId = uid;
      (req.session as any).firebaseSynced = true;
      mergeSessionActivity(req.sessionID, uid).catch(() => {});

      res.json({ success: true, message: "Session synchronised", userId: uid });
    } catch (error) {
      console.error("[sync-session] Error:", error);
      res.status(500).json({ success: false, message: "Session sync failed — please try again" });
    }
  });

  // Clear the server session when Firebase user logs out.
  app.post("/api/auth/clear-session", (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error("[clear-session] Error:", err);
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Session cleared" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
