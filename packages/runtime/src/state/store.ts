export interface StateStore {
  get(agentName: string): Promise<Record<string, unknown> | null>;
  set(agentName: string, state: Record<string, unknown>): Promise<void>;
  delete(agentName: string): Promise<void>;
}
