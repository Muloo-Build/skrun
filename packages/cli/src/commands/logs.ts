import type { Command } from "commander";
import { getRegistryUrl, getToken } from "../utils/auth.js";
import * as format from "../utils/format.js";

export function registerLogsCommand(program: Command): void {
  program
    .command("logs <agent>")
    .description("Show recent execution logs for a deployed agent")
    .option("-n, --lines <n>", "Number of recent runs to show", "10")
    .action(async (agentRef: string, opts) => {
      const token = getToken();
      if (!token) {
        format.error("Not logged in. Run `skrun login` first.");
        process.exit(1);
      }

      const parts = agentRef.split("/");
      if (parts.length !== 2) {
        format.error('Invalid agent name. Use format: namespace/name (e.g., "acme/seo-audit")');
        process.exit(1);
      }
      const [namespace, name] = parts;

      const registryUrl = getRegistryUrl();
      const url = `${registryUrl}/api/agents/${namespace}/${name}/logs?limit=${opts.lines}`;

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            format.error(`Agent ${namespace}/${name} not found or no logs available.`);
          } else {
            format.error(`Failed to fetch logs (${res.status})`);
          }
          process.exit(1);
        }

        const data = (await res.json()) as { logs: Array<Record<string, unknown>> };
        const logs = data.logs ?? [];

        if (logs.length === 0) {
          format.info(`No execution logs for ${namespace}/${name}.`);
          return;
        }

        console.log(`Recent runs for ${namespace}/${name}:\n`);
        for (const log of logs) {
          const status = log.status === "completed" ? "✓" : "✗";
          const statusColor = log.status === "completed" ? "\x1b[32m" : "\x1b[31m";
          console.log(
            `  ${statusColor}${status}\x1b[0m ${log.run_id} | ${log.duration_ms}ms | $${(log.cost as number)?.toFixed(4) ?? "?"} | ${log.timestamp}`,
          );
        }
        console.log("");
      } catch (err) {
        format.error(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    });
}
