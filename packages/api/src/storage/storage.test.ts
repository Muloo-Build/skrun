import { beforeEach, describe, expect, it } from "vitest";
import { MemoryStorage } from "./memory.js";

describe("MemoryStorage", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it("should put and get a buffer", async () => {
    const data = Buffer.from("hello world");
    await storage.put("test/key", data);
    const result = await storage.get("test/key");
    expect(result).toEqual(data);
  });

  it("should return null for non-existent key", async () => {
    const result = await storage.get("missing/key");
    expect(result).toBeNull();
  });

  it("should check existence correctly", async () => {
    expect(await storage.exists("test/key")).toBe(false);
    await storage.put("test/key", Buffer.from("data"));
    expect(await storage.exists("test/key")).toBe(true);
  });

  it("should delete a key", async () => {
    await storage.put("test/key", Buffer.from("data"));
    await storage.delete("test/key");
    expect(await storage.exists("test/key")).toBe(false);
    expect(await storage.get("test/key")).toBeNull();
  });

  it("should store independent copies", async () => {
    const data = Buffer.from("original");
    await storage.put("key1", data);
    await storage.put("key2", Buffer.from("other"));
    const result = await storage.get("key1");
    expect(result?.toString()).toBe("original");
  });

  it("should overwrite existing key", async () => {
    await storage.put("key", Buffer.from("v1"));
    await storage.put("key", Buffer.from("v2"));
    const result = await storage.get("key");
    expect(result?.toString()).toBe("v2");
  });

  it("should clear all data", async () => {
    await storage.put("a", Buffer.from("1"));
    await storage.put("b", Buffer.from("2"));
    storage.clear();
    expect(await storage.exists("a")).toBe(false);
    expect(await storage.exists("b")).toBe(false);
  });
});
