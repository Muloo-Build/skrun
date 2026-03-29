export type AuditAction =
  | "run_start"
  | "llm_call"
  | "tool_call"
  | "run_complete"
  | "run_failed"
  | "timeout"
  | "cost_exceeded";

export interface AuditEntry {
  runId: string;
  agentName: string;
  timestamp: string;
  action: AuditAction;
  details: Record<string, unknown>;
}

export class AuditLogger {
  log(entry: AuditEntry): void {
    console.log(JSON.stringify(entry));
  }
}
