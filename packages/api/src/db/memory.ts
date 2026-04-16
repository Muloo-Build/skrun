import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Agent, AgentVersion } from "./schema.js";

interface DbSnapshot {
  agents: Agent[];
  versions: AgentVersion[];
}

export class MemoryDb {
  private agents = new Map<string, Agent>();
  private versions = new Map<string, AgentVersion[]>();

  constructor(private filePath?: string) {
    this.load();
  }

  private agentKey(namespace: string, name: string): string {
    return `${namespace}/${name}`;
  }

  private load(): void {
    if (!this.filePath || !existsSync(this.filePath)) {
      return;
    }

    try {
      const raw = readFileSync(this.filePath, "utf-8");
      const snapshot = JSON.parse(raw) as Partial<DbSnapshot>;

      this.agents.clear();
      this.versions.clear();

      for (const agent of snapshot.agents ?? []) {
        this.agents.set(this.agentKey(agent.namespace, agent.name), agent);
      }

      for (const version of snapshot.versions ?? []) {
        const versions = this.versions.get(version.agent_id) ?? [];
        versions.push(version);
        this.versions.set(version.agent_id, versions);
      }
    } catch (error) {
      console.warn("[Skrun] Failed to load persisted registry metadata:", error);
    }
  }

  private persist(): void {
    if (!this.filePath) {
      return;
    }

    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const snapshot: DbSnapshot = {
      agents: [...this.agents.values()],
      versions: [...this.versions.values()].flat(),
    };

    writeFileSync(this.filePath, JSON.stringify(snapshot, null, 2));
  }

  createAgent(data: {
    name: string;
    namespace: string;
    description: string;
    owner_id: string;
  }): Agent {
    const key = this.agentKey(data.namespace, data.name);
    const now = new Date().toISOString();
    const agent: Agent = {
      id: randomUUID(),
      ...data,
      verified: false,
      created_at: now,
      updated_at: now,
    };
    this.agents.set(key, agent);
    this.versions.set(agent.id, []);
    this.persist();
    return agent;
  }

  getAgent(namespace: string, name: string): Agent | null {
    return this.agents.get(this.agentKey(namespace, name)) ?? null;
  }

  listAgents(page: number, limit: number): { agents: Agent[]; total: number } {
    const all = [...this.agents.values()];
    const start = (page - 1) * limit;
    return {
      agents: all.slice(start, start + limit),
      total: all.length,
    };
  }

  createVersion(
    agentId: string,
    data: { version: string; size: number; bundle_key: string },
  ): AgentVersion {
    const version: AgentVersion = {
      id: randomUUID(),
      agent_id: agentId,
      ...data,
      pushed_at: new Date().toISOString(),
    };
    const versions = this.versions.get(agentId) ?? [];
    versions.push(version);
    this.versions.set(agentId, versions);

    // Update agent's updated_at
    for (const agent of this.agents.values()) {
      if (agent.id === agentId) {
        agent.updated_at = version.pushed_at;
        break;
      }
    }

    this.persist();
    return version;
  }

  getVersions(agentId: string): AgentVersion[] {
    return this.versions.get(agentId) ?? [];
  }

  getLatestVersion(agentId: string): AgentVersion | null {
    const versions = this.getVersions(agentId);
    return versions.length > 0 ? versions[versions.length - 1] : null;
  }

  getVersionByNumber(agentId: string, version: string): AgentVersion | null {
    const versions = this.getVersions(agentId);
    return versions.find((v) => v.version === version) ?? null;
  }

  setVerified(namespace: string, name: string, verified: boolean): Agent | null {
    const agent = this.getAgent(namespace, name);
    if (!agent) return null;
    agent.verified = verified;
    agent.updated_at = new Date().toISOString();
    this.persist();
    return agent;
  }

  clear(): void {
    this.agents.clear();
    this.versions.clear();
    this.persist();
  }
}
