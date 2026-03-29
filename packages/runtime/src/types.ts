import type { AgentConfig } from "@skrun-dev/schema";

export interface RunRequest {
  agentConfig: AgentConfig;
  skillContent: string;
  agentsMdContent?: string;
  input: Record<string, unknown>;
  runId: string;
  state?: Record<string, unknown>;
}

export interface RunResult {
  runId: string;
  status: "completed" | "failed";
  output: Record<string, unknown>;
  newState?: Record<string, unknown>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  durationMs: number;
  error?: string;
}
