import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // /assets/* requests that were not served by express.static() mean the file
  // does not exist in this build (stale hash, deleted file, etc.).
  // Return 404 — never serve index.html in place of a missing JS or CSS file.
  // Without this guard, a browser holding a stale index.html that references
  // an old asset hash gets back HTML with status 200, the browser tries to
  // execute it as JavaScript, throws a syntax error, and React never mounts.
  app.use("/assets/{*path}", (_req, res) => {
    res.status(404).end();
  });

  // All other unmatched paths are SPA client-side routes — serve index.html.
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
