import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { ValidationError } from "../errors.js";
import type { AgentConfig } from "../schemas/agent-config.js";
import { AgentConfigSchema } from "../schemas/agent-config.js";

export interface ParsedAgentYaml {
  config: AgentConfig;
  raw: string;
  filePath?: string;
}

export function parseAgentYaml(content: string): ParsedAgentYaml {
  let rawData: unknown;
  try {
    rawData = parseYaml(content);
  } catch (cause) {
    throw new ValidationError(
      "Failed to parse agent.yaml",
      [
        {
          code: "INVALID_YAML",
          message: `YAML parse error: ${cause instanceof Error ? cause.message : String(cause)}`,
        },
      ],
      cause,
    );
  }

  if (!rawData || typeof rawData !== "object") {
    throw new ValidationError("agent.yaml must contain a YAML object", [
      {
        code: "INVALID_STRUCTURE",
        message: "Expected a YAML object, got a scalar or empty document",
      },
    ]);
  }

  const result = AgentConfigSchema.safeParse(rawData);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      code: "INVALID_FIELD",
      message: `${issue.path.join(".")}: ${issue.message}`,
      field: issue.path.join("."),
    }));
    throw new ValidationError("Invalid agent.yaml", issues, result.error);
  }

  return {
    config: result.data,
    raw: content,
  };
}

export async function parseAgentYamlFile(filePath: string): Promise<ParsedAgentYaml> {
  const content = await readFile(filePath, "utf-8");
  const parsed = parseAgentYaml(content);
  parsed.filePath = filePath;
  return parsed;
}
