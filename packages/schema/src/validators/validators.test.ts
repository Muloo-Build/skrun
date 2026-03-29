import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateAgent } from "./combined.js";

const FIXTURES = resolve(import.meta.dirname, "../../tests/fixtures");

describe("validateAgent", () => {
  it("should validate a valid agent directory", async () => {
    const result = await validateAgent(resolve(FIXTURES, "valid-agent-dir"));
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.parsed).not.toBeNull();
    expect(result.parsed?.skill.frontmatter.name).toBe("pdf-processing");
    expect(result.parsed?.agentConfig.config.name).toBe("acme/seo-audit");
  });

  it("should return error for missing SKILL.md", async () => {
    const result = await validateAgent(resolve(FIXTURES, "missing-skill-dir"));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "MISSING_SKILL_MD")).toBe(true);
    expect(result.parsed).toBeNull();
  });

  it("should return error for missing agent.yaml", async () => {
    // Create a temp dir with just SKILL.md — use a non-existent path
    const result = await validateAgent(resolve(FIXTURES, "nonexistent-dir"));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "MISSING_SKILL_MD")).toBe(true);
    expect(result.errors.some((e) => e.code === "MISSING_AGENT_YAML")).toBe(true);
  });

  it("should return error for persistent mode without AGENTS.md", async () => {
    const result = await validateAgent(resolve(FIXTURES, "persistent-no-agents-dir"));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "CONTEXT_MODE_NO_AGENTS_MD")).toBe(true);
  });

  it("should return name mismatch warning", async () => {
    // valid-agent-dir has SKILL.md name "pdf-processing" but agent.yaml slug "seo-audit"
    const result = await validateAgent(resolve(FIXTURES, "valid-agent-dir"));
    expect(result.warnings.some((w) => w.code === "NAME_MISMATCH")).toBe(true);
    expect(result.valid).toBe(true); // warnings don't block
  });

  it("should not return warnings as errors", async () => {
    const result = await validateAgent(resolve(FIXTURES, "valid-agent-dir"));
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
  });
});
