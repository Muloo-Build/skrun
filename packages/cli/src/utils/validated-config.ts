import type { AgentConfig, ValidationResult } from "@skrun-dev/schema";

/**
 * Extract validated AgentConfig from a ValidationResult.
 * Replaces non-null assertions (result.parsed!.agentConfig.config)
 * with a safe accessor that throws if validation didn't produce a config.
 */
export function getValidatedConfig(result: ValidationResult): AgentConfig {
  if (!result.valid || !result.parsed) {
    throw new Error("Cannot get config from invalid validation result");
  }
  return result.parsed.agentConfig.config;
}
