import { v2 as cloudinary } from "cloudinary";
import type { Request, Response } from "express";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export function isCloudinaryConfigured(): boolean {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadToCloudinary(file: string, folder: string, publicId?: string): Promise<string> {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary not configured");
  const result = await cloudinary.uploader.upload(file, {
    folder: `freelanceskills/${folder}`,
    ...(publicId ? { public_id: publicId } : {}),
  });
  return result.secure_url;
}

export async function uploadFromBuffer(buffer: Buffer, folder: string, mimeType?: string): Promise<string> {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary not configured");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `freelanceskills/${folder}`,
        resource_type: mimeType?.startsWith("image/") ? "image" : "auto",
      },
      (err, result) => {
        if (err || !result) reject(err || new Error("Upload failed"));
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export function registerCloudinaryRoutes(app: any) {
  // POST /api/upload/profile — base64 image from frontend
  app.post("/api/upload/profile", async (req: Request, res: Response) => {
    try {
      const { image, userId } = req.body;
      if (!image) return res.status(400).json({ error: "No image provided" });
      const url = await uploadFromBuffer(Buffer.from(image, "base64"), "profiles", userId);
      res.json({ url });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Upload failed" });
    }
  });

  // POST /api/upload/document — base64 document
  app.post("/api/upload/document", async (req: Request, res: Response) => {
    try {
      const { file, name, type } = req.body;
      if (!file) return res.status(400).json({ error: "No file provided" });
      const url = await uploadFromBuffer(Buffer.from(file, "base64"), "documents", name);
      res.json({ url, name, type });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Upload failed" });
    }
  });

  // GET /api/upload/status
  app.get("/api/upload/status", (_req: Request, res: Response) => {
    res.json({ configured: isCloudinaryConfigured() });
  });
}
