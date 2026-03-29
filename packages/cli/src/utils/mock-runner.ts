import { randomUUID } from "node:crypto";
import type { AgentConfig } from "@skrun-dev/schema";
import { ValidationError } from "@skrun-dev/schema";

export interface MockRunResult {
  run_id: string;
  status: "completed";
  output: Record<string, unknown>;
  duration_ms: number;
}

function makePlaceholder(type: string): unknown {
  switch (type) {
    case "string":
      return "mock_value";
    case "number":
      return 0;
    case "boolean":
      return true;
    case "object":
      return {};
    case "array":
      return [];
    default:
      return null;
  }
}

export function mockRun(config: AgentConfig, input: Record<string, unknown>): MockRunResult {
  // Validate required inputs
  for (const field of config.inputs) {
    if (field.required && !(field.name in input)) {
      throw new ValidationError(`Missing required input: ${field.name}`, [
        {
          code: "MISSING_INPUT",
          message: `Input "${field.name}" is required but was not provided`,
          field: field.name,
        },
      ]);
    }
  }

  // Generate mock output
  const output: Record<string, unknown> = {};
  for (const field of config.outputs) {
    output[field.name] = makePlaceholder(field.type);
  }

  return {
    run_id: randomUUID(),
    status: "completed",
    output,
    duration_ms: 0,
  };
}
