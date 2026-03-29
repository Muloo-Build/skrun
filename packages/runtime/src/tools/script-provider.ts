import { execFile } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";
import type { ToolDefinition, ToolProvider, ToolResult } from "./types.js";

const SCRIPT_TIMEOUT = 30_000; // 30 seconds
const SUPPORTED_EXTENSIONS = new Set([".ts", ".js", ".py"]);

export class ScriptToolProvider implements ToolProvider {
  private scripts = new Map<string, { path: string; ext: string }>();

  constructor(private scriptsDir: string) {
    this.scanScripts();
  }

  private scanScripts(): void {
    if (!existsSync(this.scriptsDir)) return;

    const files = readdirSync(this.scriptsDir);
    for (const file of files) {
      const ext = extname(file);
      if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
      const name = basename(file, ext);
      this.scripts.set(name, { path: join(this.scriptsDir, file), ext });
    }
  }

  async listTools(): Promise<ToolDefinition[]> {
    return [...this.scripts.entries()].map(([name]) => ({
      name,
      description: `Execute ${name} script`,
      parameters: {
        type: "object",
        properties: {
          args: { type: "string", description: "JSON arguments for the script" },
        },
      },
    }));
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const script = this.scripts.get(name);
    if (!script) {
      return { content: `Script "${name}" not found`, isError: true };
    }

    const command = script.ext === ".py" ? "python3" : "node";
    const cmdArgs = script.ext === ".py" ? [script.path] : ["--input-type=module", script.path];

    return new Promise((resolve) => {
      const child = execFile(
        command,
        cmdArgs,
        { timeout: SCRIPT_TIMEOUT },
        (error, stdout, stderr) => {
          if (error) {
            resolve({ content: stderr || error.message, isError: true });
          } else {
            resolve({ content: stdout.trim(), isError: false });
          }
        },
      );

      // Pass args via stdin
      if (child.stdin) {
        child.stdin.write(JSON.stringify(args));
        child.stdin.end();
      }
    });
  }

  async disconnect(): Promise<void> {
    // Nothing to disconnect
  }
}
