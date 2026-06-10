/**
 * Cloudinary Upload Service — FreelanceSkills
 *
 * Endpoints:
 *   POST /api/upload/profile          — profile pic (multipart or base64), auth required, 400×400 crop
 *   POST /api/upload/portfolio        — portfolio image (multipart), auth required, max 6 per user
 *   GET  /api/upload/portfolio        — list user's portfolio images
 *   DELETE /api/upload/portfolio/:id  — remove a portfolio image (by DB row id)
 *   POST /api/upload/document         — KYC document (base64 or multipart), auth required
 *   GET  /api/upload/status           — Cloudinary config status (public)
 *
 * Falls back to multer disk storage under uploads/ when Cloudinary is not configured.
 */

import { v2 as cloudinary } from "cloudinary";
import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db";
import { portfolioImages, profiles } from "@shared/schema";
import { eq, count, desc } from "drizzle-orm";
import { log } from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export function isCloudinaryConfigured(): boolean {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAuth(req: any, res: Response, next: any) {
  if (!(req.session as any)?.userId) {
    return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication required." });
  }
  next();
}

// ── Multer configs ────────────────────────────────────────────────────────────
const memUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are accepted"));
  },
});

const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Unsupported file type"));
  },
});

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── Core upload helpers ───────────────────────────────────────────────────────
export async function uploadToCloudinary(file: string, folder: string, publicId?: string): Promise<string> {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary not configured");
  const result = await cloudinary.uploader.upload(file, {
    folder: `freelanceskills/${folder}`,
    ...(publicId ? { public_id: publicId } : {}),
  });
  return result.secure_url;
}

export async function uploadFromBuffer(
  buffer: Buffer,
  folder: string,
  options?: { mimeType?: string; transformation?: object[]; publicId?: string }
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary not configured");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `freelanceskills/${folder}`,
        resource_type: options?.mimeType?.startsWith("image/") ? "image" : "auto",
        ...(options?.transformation ? { transformation: options.transformation } : {}),
        ...(options?.publicId ? { public_id: options.publicId } : {}),
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    log("warn", `[Cloudinary] Failed to delete asset ${publicId}: ${err}`);
  }
}

function saveToDisk(buffer: Buffer, folder: string, filename: string): string {
  const dir = path.join("uploads", folder);
  ensureDir(dir);
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/${filePath}`;
}

// ── Route registration ────────────────────────────────────────────────────────
export function registerCloudinaryRoutes(app: any) {

  // ── GET /api/upload/status ─────────────────────────────────────────────────
  app.get("/api/upload/status", (_req: Request, res: Response) => {
    res.json({ configured: isCloudinaryConfigured() });
  });

  // ── POST /api/upload/profile ───────────────────────────────────────────────
  app.post("/api/upload/profile", requireAuth, memUpload.single("image"), async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;

      let buffer: Buffer;
      let mimeType = "image/jpeg";

      if (req.file) {
        buffer = req.file.buffer;
        mimeType = req.file.mimetype;
      } else if (req.body?.image) {
        buffer = Buffer.from(req.body.image, "base64");
      } else {
        return res.status(400).json({ success: false, message: "No image provided. Send multipart/form-data with field 'image' or JSON with base64 'image'." });
      }

      let url: string;

      if (isCloudinaryConfigured()) {
        const result = await uploadFromBuffer(buffer, "profiles", {
          mimeType,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto", fetch_format: "webp" },
          ],
          publicId: `profile_${userId}`,
        });
        url = result.url;
      } else {
        const ext = mimeType.split("/")[1] || "jpg";
        url = saveToDisk(buffer, "avatars", `${userId}_${Date.now()}.${ext}`);
      }

      // Update profile photo
      await db.update(profiles)
        .set({ photoUrl: url, updatedAt: new Date() })
        .where(eq(profiles.userId, userId));

      res.json({ success: true, url });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Upload failed" });
    }
  });

  // ── POST /api/upload/portfolio ─────────────────────────────────────────────
  app.post("/api/upload/portfolio", requireAuth, memUpload.single("image"), async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image provided. Send multipart/form-data with field 'image'." });
      }

      const MAX_PORTFOLIO = 6;
      const [countRow] = await db.select({ c: count() })
        .from(portfolioImages).where(eq(portfolioImages.userId, userId));
      const currentCount = Number(countRow?.c || 0);

      if (currentCount >= MAX_PORTFOLIO) {
        // Delete the oldest one to make room
        const [oldest] = await db.select().from(portfolioImages)
          .where(eq(portfolioImages.userId, userId))
          .orderBy(portfolioImages.createdAt)
          .limit(1);

        if (oldest) {
          if (oldest.cloudinaryPublicId) await deleteFromCloudinary(oldest.cloudinaryPublicId);
          await db.delete(portfolioImages).where(eq(portfolioImages.id, oldest.id));
        }
      }

      let url: string;
      let cloudinaryPublicId: string | undefined;

      if (isCloudinaryConfigured()) {
        const result = await uploadFromBuffer(req.file.buffer, "portfolio", {
          mimeType: req.file.mimetype,
          transformation: [
            { width: 1200, height: 900, crop: "limit", quality: "auto:good", fetch_format: "webp" },
          ],
        });
        url = result.url;
        cloudinaryPublicId = result.publicId;
      } else {
        const ext = req.file.mimetype.split("/")[1] || "jpg";
        url = saveToDisk(req.file.buffer, "portfolio", `${userId}_${Date.now()}.${ext}`);
      }

      const caption = (req.body?.caption as string)?.substring(0, 200) || null;
      const [image] = await db.insert(portfolioImages).values({
        userId, url, cloudinaryPublicId: cloudinaryPublicId || null, caption,
      }).returning();

      res.json({ success: true, image });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Upload failed" });
    }
  });

  // ── GET /api/upload/portfolio ──────────────────────────────────────────────
  app.get("/api/upload/portfolio", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const images = await db.select().from(portfolioImages)
        .where(eq(portfolioImages.userId, userId))
        .orderBy(desc(portfolioImages.createdAt));
      res.json({ success: true, images, total: images.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to fetch portfolio" });
    }
  });

  // ── DELETE /api/upload/portfolio/:id ──────────────────────────────────────
  app.delete("/api/upload/portfolio/:id", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { id } = req.params;

      const [image] = await db.select().from(portfolioImages)
        .where(eq(portfolioImages.id, id)).limit(1);

      if (!image) {
        return res.status(404).json({ success: false, message: "Portfolio image not found." });
      }
      if (image.userId !== userId) {
        return res.status(403).json({ success: false, message: "Not your portfolio image." });
      }

      if (image.cloudinaryPublicId) await deleteFromCloudinary(image.cloudinaryPublicId);
      await db.delete(portfolioImages).where(eq(portfolioImages.id, id));

      res.json({ success: true, message: "Portfolio image removed." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to delete image" });
    }
  });

  // ── POST /api/upload/document ──────────────────────────────────────────────
  app.post("/api/upload/document", requireAuth, docUpload.single("file"), async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;

      let buffer: Buffer;
      let mimeType = "application/octet-stream";
      let name = "document";

      if (req.file) {
        buffer = req.file.buffer;
        mimeType = req.file.mimetype;
        name = req.file.originalname;
      } else if (req.body?.file) {
        buffer = Buffer.from(req.body.file, "base64");
        name = req.body?.name || "document";
        mimeType = req.body?.type || "application/octet-stream";
      } else {
        return res.status(400).json({ success: false, message: "No file provided." });
      }

      let url: string;

      if (isCloudinaryConfigured()) {
        const result = await uploadFromBuffer(buffer, `documents/${userId}`, {
          mimeType,
        });
        url = result.url;
      } else {
        const ext = path.extname(name) || ".bin";
        url = saveToDisk(buffer, "kyc", `${userId}_${Date.now()}${ext}`);
      }

      res.json({ success: true, url, name, type: mimeType });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Upload failed" });
    }
  });

  log("info", "[routes] Cloudinary upload routes registered with auth + multipart support");
}
