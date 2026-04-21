import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { registerPrerenderRoutes } from "./prerender";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    maxAge: "1y",
    immutable: true,
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === ".html") {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  }));

  // /assets/* requests that were not served by express.static() mean the file
  // does not exist in this build (stale hash, deleted file, etc.).
  // Return 404 — never serve index.html in place of a missing JS or CSS file.
  app.use("/assets/{*path}", (_req, res) => {
    res.status(404).end();
  });

  // Register bot prerender routes BEFORE the SPA catch-all.
  // Bots get real HTML; browsers get the SPA.
  registerPrerenderRoutes(app);

  // All other unmatched paths are SPA client-side routes — serve index.html.
  app.use("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
