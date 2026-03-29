import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { McpToolProvider } from "./mcp-provider.js";

const MOCK_SERVER = resolve(import.meta.dirname, "../../tests/fixtures/mock-mcp-server.js");

describe("McpToolProvider — stdio transport", () => {
  it("should connect to a stdio MCP server and list tools", async () => {
    const provider = new McpToolProvider({
      name: "test-stdio",
      transport: "stdio",
      command: "node",
      args: [MOCK_SERVER],
      auth: "none",
    });

    const tools = await provider.listTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some((t) => t.name === "echo")).toBe(true);

    await provider.disconnect();
  });

  it("should call a tool via stdio and get result", async () => {
    const provider = new McpToolProvider({
      name: "test-stdio",
      transport: "stdio",
      command: "node",
      args: [MOCK_SERVER],
      auth: "none",
    });

    await provider.listTools(); // triggers connect
    const result = await provider.callTool("echo", { text: "hello" });
    expect(result.isError).toBe(false);
    expect(result.content).toContain("hello");

    await provider.disconnect();
  });

  it("should handle command not found gracefully", async () => {
    const provider = new McpToolProvider({
      name: "test-missing",
      transport: "stdio",
      command: "nonexistent-command-xyz",
      args: [],
      auth: "none",
    });

    const tools = await provider.listTools();
    expect(tools).toEqual([]);

    await provider.disconnect();
  });

  it("should return transport mode correctly", async () => {
    const stdioProvider = new McpToolProvider({
      name: "t1",
      transport: "stdio",
      command: "node",
      auth: "none",
    });
    // Access private method via any for testing
    // biome-ignore lint/suspicious/noExplicitAny: testing private method
    expect((stdioProvider as any).getTransportMode()).toBe("stdio");

    const urlProvider = new McpToolProvider({
      name: "t2",
      url: "https://example.com/mcp",
      auth: "none",
    });
    // biome-ignore lint/suspicious/noExplicitAny: testing private method
    expect((urlProvider as any).getTransportMode()).toBe("streamable-http");

    const sseProvider = new McpToolProvider({
      name: "t3",
      url: "https://example.com/sse",
      transport: "sse",
      auth: "none",
    });
    // biome-ignore lint/suspicious/noExplicitAny: testing private method
    expect((sseProvider as any).getTransportMode()).toBe("sse");
  });
});
