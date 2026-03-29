import type { ToolDefinition, ToolProvider, ToolResult } from "./types.js";

export class ToolRegistry {
  private providers: ToolProvider[] = [];
  private toolMap = new Map<string, ToolProvider>();

  async addProvider(provider: ToolProvider): Promise<void> {
    this.providers.push(provider);
    const tools = await provider.listTools();
    for (const tool of tools) {
      this.toolMap.set(tool.name, provider);
    }
  }

  async listTools(): Promise<ToolDefinition[]> {
    const allTools: ToolDefinition[] = [];
    for (const provider of this.providers) {
      const tools = await provider.listTools();
      allTools.push(...tools);
    }
    return allTools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const provider = this.toolMap.get(name);
    if (!provider) {
      return { content: `Tool "${name}" not found`, isError: true };
    }
    return provider.callTool(name, args);
  }

  async disconnectAll(): Promise<void> {
    for (const provider of this.providers) {
      await provider.disconnect();
    }
  }
}
