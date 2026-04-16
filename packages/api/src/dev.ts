import { serve } from "@hono/node-server";
import { MemoryDb } from "./db/memory.js";
import { createApp } from "./index.js";
import { MemoryStorage } from "./storage/memory.js";

const storage = new MemoryStorage();
const db = new MemoryDb();
const app = createApp(storage, db);
const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port, hostname: host }, () => {
  const visibleHost = host === "0.0.0.0" ? "localhost" : host;
  console.log(`✓ Skrun Registry API running at http://${visibleHost}:${port}`);
  console.log("  GET  /health — Health check");
  console.log("  POST /api/run — Muloo Agent Gateway");
  console.log("  POST /api/agents/:ns/:name/push — Push agent bundle");
  console.log("  GET  /api/agents/:ns/:name/pull — Pull agent bundle");
  console.log("  GET  /api/agents — List agents");
  console.log(`  Auth: Bearer ${process.env.SKRUN_API_TOKEN ? "<SKRUN_API_TOKEN>" : "dev-token"}`);
});
