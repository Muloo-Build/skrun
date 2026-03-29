import { z } from "zod";

export const McpServerSchema = z
  .object({
    name: z.string().min(1, "MCP server name is required"),
    // Remote servers
    url: z.string().url("MCP server URL must be a valid URL").optional(),
    // Transport mode: stdio (local), sse (legacy remote), streamable-http (new default remote)
    transport: z.enum(["stdio", "sse", "streamable-http"]).optional(),
    // Stdio: command to spawn the MCP server process
    command: z.string().optional(),
    // Stdio: arguments for the command
    args: z.array(z.string()).optional(),
    // Auth (remote only)
    auth: z.enum(["none", "api_key", "oauth2"]).default("none"),
  })
  .refine(
    (data) => data.url || (data.transport === "stdio" && data.command),
    "Either 'url' (for remote) or 'transport: stdio' + 'command' (for local) is required",
  );

export type McpServer = z.infer<typeof McpServerSchema>;
