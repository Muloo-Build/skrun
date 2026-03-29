import { stringify } from "yaml";
import type { AgentConfig } from "../schemas/agent-config.js";

export function serializeAgentYaml(config: AgentConfig): string {
  return stringify(config, {
    indent: 2,
    lineWidth: 0,
    defaultKeyType: "PLAIN",
    defaultStringType: "PLAIN",
  });
}
