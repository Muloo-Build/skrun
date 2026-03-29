import type { RunRequest, RunResult } from "../types.js";

export interface RuntimeAdapter {
  execute(request: RunRequest): Promise<RunResult>;
}
