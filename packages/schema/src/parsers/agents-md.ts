import { readFile } from "node:fs/promises";
import { ValidationError } from "../errors.js";

export interface ParsedAgentsMd {
  content: string;
  filePath?: string;
}

export function parseAgentsMd(content: string): ParsedAgentsMd {
  const trimmed = content.trim();

  if (!trimmed) {
    throw new ValidationError("AGENTS.md must not be empty", [
      { code: "EMPTY_AGENTS_MD", message: "AGENTS.md file is empty or contains only whitespace" },
    ]);
  }

  return { content: trimmed };
}

export async function parseAgentsMdFile(filePath: string): Promise<ParsedAgentsMd> {
  const content = await readFile(filePath, "utf-8");
  const parsed = parseAgentsMd(content);
  parsed.filePath = filePath;
  return parsed;
}
