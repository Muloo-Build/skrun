import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LLMCallResponse, LLMProvider } from "./providers/types.js";
import { LLMRouter } from "./router.js";

function createMockProvider(name: string, response?: Partial<LLMCallResponse>): LLMProvider {
  return {
    name,
    call: vi.fn().mockResolvedValue({
      content: response?.content ?? `Response from ${name}`,
      toolCalls: response?.toolCalls,
      usage: response?.usage ?? { promptTokens: 100, completionTokens: 50 },
    }),
  };
}

function createFailingProvider(name: string): LLMProvider {
  return {
    name,
    call: vi.fn().mockRejectedValue(new Error(`${name} failed`)),
  };
}

describe("LLMRouter", () => {
  let router: LLMRouter;

  beforeEach(() => {
    router = new LLMRouter();
  });

  it("should route to the correct provider", async () => {
    const mock = createMockProvider("anthropic");
    router.registerProvider("anthropic", mock);

    const result = await router.call(
      { provider: "anthropic", name: "claude-sonnet-4-20250514" },
      "system",
      "user message",
    );

    expect(result.content).toBe("Response from anthropic");
    expect(result.provider).toBe("anthropic");
    expect(mock.call).toHaveBeenCalledOnce();
  });

  it("should fallback on primary failure", async () => {
    router.registerProvider("anthropic", createFailingProvider("anthropic"));
    router.registerProvider("openai", createMockProvider("openai"));

    const result = await router.call(
      {
        provider: "anthropic",
        name: "claude-sonnet-4-20250514",
        fallback: { provider: "openai", name: "gpt-4o" },
      },
      "system",
      "user",
    );

    expect(result.content).toBe("Response from openai");
    expect(result.provider).toBe("openai");
  });

  it("should throw if primary fails and no fallback", async () => {
    router.registerProvider("anthropic", createFailingProvider("anthropic"));

    await expect(
      router.call({ provider: "anthropic", name: "model" }, "sys", "user"),
    ).rejects.toThrow("anthropic failed");
  });

  it("should throw if provider not registered", async () => {
    await expect(
      router.call({ provider: "anthropic", name: "model" }, "sys", "user"),
    ).rejects.toThrow('Provider "anthropic" not available');
  });

  it("should track token usage", async () => {
    router.registerProvider("anthropic", createMockProvider("anthropic"));

    const result = await router.call(
      { provider: "anthropic", name: "claude-sonnet-4-20250514" },
      "sys",
      "user",
    );

    expect(result.usage.promptTokens).toBe(100);
    expect(result.usage.completionTokens).toBe(50);
    expect(result.usage.totalTokens).toBe(150);
  });

  it("should estimate cost", async () => {
    router.registerProvider("anthropic", createMockProvider("anthropic"));

    const result = await router.call(
      { provider: "anthropic", name: "claude-sonnet-4-20250514" },
      "sys",
      "user",
    );

    expect(result.estimatedCost).toBeGreaterThan(0);
  });

  it("should measure duration", async () => {
    router.registerProvider("anthropic", createMockProvider("anthropic"));

    const result = await router.call(
      { provider: "anthropic", name: "claude-sonnet-4-20250514" },
      "sys",
      "user",
    );

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("should execute tool calling loop", async () => {
    let callCount = 0;
    const provider: LLMProvider = {
      name: "anthropic",
      call: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            content: "",
            toolCalls: [{ name: "search", args: { q: "test" }, id: "t1" }],
            usage: { promptTokens: 100, completionTokens: 20 },
          };
        }
        return {
          content: "Final answer after tool use",
          usage: { promptTokens: 150, completionTokens: 50 },
        };
      }),
    };

    router.registerProvider("anthropic", provider);

    const onToolCall = vi.fn().mockResolvedValue({
      name: "search",
      result: "search results here",
      id: "t1",
    });

    const result = await router.call(
      { provider: "anthropic", name: "claude-sonnet-4-20250514" },
      "sys",
      "user",
      [{ name: "search", description: "Search", parameters: {} }],
      onToolCall,
    );

    expect(result.content).toBe("Final answer after tool use");
    expect(onToolCall).toHaveBeenCalledOnce();
    expect(provider.call).toHaveBeenCalledTimes(2);
    expect(result.usage.totalTokens).toBe(320); // 100+150 + 20+50
  });
});
