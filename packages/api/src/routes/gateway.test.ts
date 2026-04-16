import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryDb } from "../db/memory.js";
import { createApp } from "../index.js";
import { MemoryStorage } from "../storage/memory.js";

describe("Muloo Gateway", () => {
  const originalApiToken = process.env.SKRUN_API_TOKEN;
  const originalNamespace = process.env.SKRUN_NAMESPACE;

  beforeEach(() => {
    process.env.SKRUN_API_TOKEN = "";
    process.env.SKRUN_NAMESPACE = "";
  });

  afterEach(() => {
    process.env.SKRUN_API_TOKEN = originalApiToken ?? "";
    process.env.SKRUN_NAMESPACE = originalNamespace ?? "";
  });

  it("requires bearer auth", async () => {
    const app = createApp(new MemoryStorage(), new MemoryDb());
    const res = await app.request("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: "muloo-demo",
        skill: "hubspot-crm-audit",
        input: { portalId: "123456" },
      }),
    });

    expect(res.status).toBe(401);
  });

  it("runs the approved read-only HubSpot audit stub", async () => {
    const app = createApp(new MemoryStorage(), new MemoryDb());
    const res = await app.request("/api/run", {
      method: "POST",
      headers: {
        Authorization: "Bearer dev-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenantId: "muloo-demo",
        skill: "hubspot-crm-audit",
        input: {
          portalId: "123456",
          objectTypes: ["contacts", "companies", "deals", "tickets"],
          auditFocus: ["properties", "pipelines", "lifecycle", "governance"],
        },
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.skill).toBe("hubspot-crm-audit");
    expect(body.result.summary.toLowerCase()).toContain("read-only");
    expect(body.result.issues.length).toBeGreaterThan(0);
  });

  it("honors SKRUN_API_TOKEN when configured", async () => {
    process.env.SKRUN_API_TOKEN = "railway-secret";

    const app = createApp(new MemoryStorage(), new MemoryDb());
    const res = await app.request("/api/run", {
      method: "POST",
      headers: {
        Authorization: "Bearer dev-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenantId: "muloo-demo",
        skill: "hubspot-crm-audit",
        input: { portalId: "123456" },
      }),
    });

    expect(res.status).toBe(401);
  });
});
