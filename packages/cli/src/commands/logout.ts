import type { Command } from "commander";
import { removeToken } from "../utils/auth.js";
import * as format from "../utils/format.js";

export function registerLogoutCommand(program: Command): void {
  program
    .command("logout")
    .description("Remove stored authentication token")
    .action(() => {
      removeToken();
      format.success("Logged out. Token removed.");
    });
}
