import { serve } from "@hono/node-server";
import { MemoryDb } from "./db/memory.js";
import { createApp } from "./index.js";
import { MemoryStorage } from "./storage/memory.js";

const storage = new MemoryStorage();
const db = new MemoryDb();
const app = createApp(storage, db);
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`✓ Skrun Registry API running at http://localhost:${port}`);
  console.log("  GET  /health — Health check");
  console.log("  POST /api/agents/:ns/:name/push — Push agent bundle");
  console.log("  GET  /api/agents/:ns/:name/pull — Pull agent bundle");
  console.log("  GET  /api/agents — List agents");
  console.log("  Auth: Bearer dev-token (namespace: dev)");
});
