import { z } from "zod";
import { InputFieldSchema, OutputFieldSchema } from "./inputs-outputs.js";
import { McpServerSchema } from "./mcp-server.js";
import { ModelConfigSchema } from "./model-config.js";
import { PermissionsSchema } from "./permissions.js";
import { RuntimeConfigSchema } from "./runtime-config.js";
import { StateConfigSchema } from "./state-config.js";
import { TestCaseSchema } from "./test-case.js";

const AGENT_NAME_REGEX = /^[a-z0-9-]+\/[a-z0-9-]+$/;
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

export const AgentConfigSchema = z.object({
  name: z
    .string()
    .min(1, "Agent name is required")
    .regex(
      AGENT_NAME_REGEX,
      'Agent name must be in "namespace/slug" format (e.g., "acme/seo-audit")',
    ),
  version: z.string().regex(SEMVER_REGEX, 'Version must be semver format (e.g., "1.0.0")'),
  model: ModelConfigSchema,
  tools: z.array(z.string()).default([]),
  mcp_servers: z.array(McpServerSchema).default([]),
  inputs: z.array(InputFieldSchema).min(1, "At least one input is required"),
  outputs: z.array(OutputFieldSchema).min(1, "At least one output is required"),
  permissions: PermissionsSchema.default({}),
  runtime: RuntimeConfigSchema.default({}),
  context_mode: z.enum(["skill", "persistent"]).default("skill"),
  state: StateConfigSchema.default({}),
  tests: z.array(TestCaseSchema).default([]),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
