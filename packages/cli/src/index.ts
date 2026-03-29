import { Command } from "commander";
import { registerBuildCommand } from "./commands/build.js";
import { registerDeployCommand } from "./commands/deploy.js";
import { registerDevCommand } from "./commands/dev.js";
import { registerInitCommand } from "./commands/init.js";
import { registerLoginCommand } from "./commands/login.js";
import { registerLogoutCommand } from "./commands/logout.js";
import { registerLogsCommand } from "./commands/logs.js";
import { registerPullCommand } from "./commands/pull.js";
import { registerPushCommand } from "./commands/push.js";
import { registerTestCommand } from "./commands/test.js";

const program = new Command();

program
  .name("skrun")
  .description("Deploy any Agent Skill as an API — The Vercel for Agent Skills")
  .version("0.1.0");

registerInitCommand(program);
registerDevCommand(program);
registerTestCommand(program);
registerBuildCommand(program);
registerLoginCommand(program);
registerLogoutCommand(program);
registerPushCommand(program);
registerPullCommand(program);
registerDeployCommand(program);
registerLogsCommand(program);

program.parse();
