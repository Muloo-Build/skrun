import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { ValidationError } from "../errors.js";
import type { SkillFrontmatter } from "../schemas/skill-frontmatter.js";
import { SkillFrontmatterSchema } from "../schemas/skill-frontmatter.js";

export interface ParsedSkill {
  frontmatter: SkillFrontmatter;
  body: string;
  filePath?: string;
}

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseSkillMd(content: string): ParsedSkill {
  const match = content.match(FRONTMATTER_REGEX);

  if (!match) {
    throw new ValidationError("SKILL.md must start with YAML frontmatter between --- delimiters", [
      { code: "MISSING_FRONTMATTER", message: "No YAML frontmatter found in SKILL.md" },
    ]);
  }

  const [, yamlContent, body] = match;

  let rawData: unknown;
  try {
    rawData = parseYaml(yamlContent);
  } catch (cause) {
    throw new ValidationError(
      "Failed to parse YAML frontmatter",
      [
        {
          code: "INVALID_YAML",
          message: `YAML parse error: ${cause instanceof Error ? cause.message : String(cause)}`,
        },
      ],
      cause,
    );
  }

  const result = SkillFrontmatterSchema.safeParse(rawData);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      code: "INVALID_FIELD",
      message: `${issue.path.join(".")}: ${issue.message}`,
      field: issue.path.join("."),
    }));
    throw new ValidationError("Invalid SKILL.md frontmatter", issues, result.error);
  }

  return {
    frontmatter: result.data,
    body: body.trim(),
  };
}

export async function parseSkillMdFile(filePath: string): Promise<ParsedSkill> {
  const content = await readFile(filePath, "utf-8");
  const parsed = parseSkillMd(content);
  parsed.filePath = filePath;
  return parsed;
}
