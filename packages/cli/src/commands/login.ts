import type { Command } from "commander";
import { saveToken } from "../utils/auth.js";
import * as format from "../utils/format.js";
import { askText } from "../utils/prompts.js";

export function registerLoginCommand(program: Command): void {
  program
    .command("login")
    .description("Authenticate with the Skrun registry")
    .option("--token <token>", "API token (non-interactive)")
    .action(async (opts) => {
      const token = opts.token ?? (await askText("Enter your API token:", "dev-token"));

      saveToken(token);
      format.success("Logged in. Token saved to ~/.skrun/config.json");
    });
}
