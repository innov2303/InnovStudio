import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getAppliedSeoMetadataOverrides } from "./seoAgent";
import { applyHomeSeoMetadata } from "./seoPages";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.get("/", async (_req, res, next) => {
    try {
      const [html, overrides] = await Promise.all([
        fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8"),
        getAppliedSeoMetadataOverrides(),
      ]);
      res
        .status(200)
        .type("html")
        .set("Cache-Control", "no-store")
        .send(applyHomeSeoMetadata(html, overrides["/"]));
    } catch (error) {
      next(error);
    }
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
