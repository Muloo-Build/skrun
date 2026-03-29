import type { StateStore } from "./store.js";

export class MemoryStateStore implements StateStore {
  private store = new Map<string, Record<string, unknown>>();

  async get(agentName: string): Promise<Record<string, unknown> | null> {
    const state = this.store.get(agentName);
    return state ? structuredClone(state) : null;
  }

  async set(agentName: string, state: Record<string, unknown>): Promise<void> {
    this.store.set(agentName, structuredClone(state));
  }

  async delete(agentName: string): Promise<void> {
    this.store.delete(agentName);
  }

  clear(): void {
    this.store.clear();
  }
}
