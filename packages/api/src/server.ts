import { join } from "node:path";
import { serve } from "@hono/node-server";
import { MemoryDb } from "./db/memory.js";
import { createApp } from "./index.js";
import { LocalStorage } from "./storage/local.js";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 4000);
const dataDir = process.env.SKRUN_DATA_DIR ?? join(process.cwd(), ".skrun-data");

if (!process.env.SKRUN_API_TOKEN) {
  console.warn(
    "[Skrun] SKRUN_API_TOKEN is not set. Protected routes will accept any Bearer token outside Railway.",
  );
}

const storage = new LocalStorage(join(dataDir, "bundles"));
const db = new MemoryDb(join(dataDir, "registry-db.json"));
const app = createApp(storage, db);

serve({ fetch: app.fetch, port, hostname: host }, () => {
  console.log(`[Skrun] listening on ${host}:${port}`);
  console.log("[Skrun] health endpoint available at /health");
  console.log("[Skrun] Muloo gateway available at /api/run");
});
