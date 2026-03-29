import { beforeEach, describe, expect, it } from "vitest";
import { MemoryDb } from "./memory.js";

describe("MemoryDb", () => {
  let db: MemoryDb;

  beforeEach(() => {
    db = new MemoryDb();
  });

  it("should create and get an agent", () => {
    const agent = db.createAgent({
      name: "seo-audit",
      namespace: "acme",
      description: "SEO audit agent",
      owner_id: "user-1",
    });
    expect(agent.id).toBeTruthy();
    expect(agent.name).toBe("seo-audit");

    const found = db.getAgent("acme", "seo-audit");
    expect(found?.id).toBe(agent.id);
  });

  it("should return null for missing agent", () => {
    expect(db.getAgent("x", "y")).toBeNull();
  });

  it("should list agents with pagination", () => {
    db.createAgent({ name: "a", namespace: "ns", description: "", owner_id: "u" });
    db.createAgent({ name: "b", namespace: "ns", description: "", owner_id: "u" });
    db.createAgent({ name: "c", namespace: "ns", description: "", owner_id: "u" });

    const page1 = db.listAgents(1, 2);
    expect(page1.agents).toHaveLength(2);
    expect(page1.total).toBe(3);

    const page2 = db.listAgents(2, 2);
    expect(page2.agents).toHaveLength(1);
  });

  it("should create and get versions", () => {
    const agent = db.createAgent({ name: "a", namespace: "ns", description: "", owner_id: "u" });
    db.createVersion(agent.id, { version: "1.0.0", size: 100, bundle_key: "ns/a/1.0.0.agent" });
    db.createVersion(agent.id, { version: "1.1.0", size: 200, bundle_key: "ns/a/1.1.0.agent" });

    const versions = db.getVersions(agent.id);
    expect(versions).toHaveLength(2);
  });

  it("should get latest version", () => {
    const agent = db.createAgent({ name: "a", namespace: "ns", description: "", owner_id: "u" });
    db.createVersion(agent.id, { version: "1.0.0", size: 100, bundle_key: "k1" });
    db.createVersion(agent.id, { version: "2.0.0", size: 200, bundle_key: "k2" });

    const latest = db.getLatestVersion(agent.id);
    expect(latest?.version).toBe("2.0.0");
  });

  it("should get version by number", () => {
    const agent = db.createAgent({ name: "a", namespace: "ns", description: "", owner_id: "u" });
    db.createVersion(agent.id, { version: "1.0.0", size: 100, bundle_key: "k1" });
    db.createVersion(agent.id, { version: "2.0.0", size: 200, bundle_key: "k2" });

    const v = db.getVersionByNumber(agent.id, "1.0.0");
    expect(v?.size).toBe(100);
    expect(db.getVersionByNumber(agent.id, "3.0.0")).toBeNull();
  });

  it("should return null for latest version on empty agent", () => {
    const agent = db.createAgent({ name: "a", namespace: "ns", description: "", owner_id: "u" });
    expect(db.getLatestVersion(agent.id)).toBeNull();
  });
});
