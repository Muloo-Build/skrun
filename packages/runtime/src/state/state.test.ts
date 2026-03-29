import { beforeEach, describe, expect, it } from "vitest";
import { MemoryStateStore } from "./memory.js";

describe("MemoryStateStore", () => {
  let store: MemoryStateStore;

  beforeEach(() => {
    store = new MemoryStateStore();
  });

  it("should set and get state", async () => {
    await store.set("acme/agent", { count: 5, history: ["a"] });
    const state = await store.get("acme/agent");
    expect(state).toEqual({ count: 5, history: ["a"] });
  });

  it("should return null for missing agent", async () => {
    const state = await store.get("nonexistent");
    expect(state).toBeNull();
  });

  it("should overwrite existing state", async () => {
    await store.set("agent", { v: 1 });
    await store.set("agent", { v: 2 });
    const state = await store.get("agent");
    expect(state).toEqual({ v: 2 });
  });

  it("should delete state", async () => {
    await store.set("agent", { data: true });
    await store.delete("agent");
    expect(await store.get("agent")).toBeNull();
  });

  it("should store independent copies (no reference sharing)", async () => {
    const original = { count: 1 };
    await store.set("agent", original);
    original.count = 999;
    const retrieved = await store.get("agent");
    expect(retrieved?.count).toBe(1);
  });
});
