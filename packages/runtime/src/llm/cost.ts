// Pricing per 1M tokens (USD) — approximate, updated 2026-03
const PRICING: Record<string, { input: number; output: number }> = {
  // Anthropic
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4 },
  "claude-opus-4-20250514": { input: 15, output: 75 },
  // OpenAI
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "o3-mini": { input: 1.1, output: 4.4 },
  // Google
  "gemini-2.5-pro": { input: 1.25, output: 10 },
  "gemini-2.5-flash": { input: 0.15, output: 0.6 },
  // Mistral
  "mistral-large-latest": { input: 2, output: 6 },
  "mistral-small-latest": { input: 0.1, output: 0.3 },
  // Groq
  "llama-3.3-70b-versatile": { input: 0.59, output: 0.79 },
  "llama-3.1-8b-instant": { input: 0.05, output: 0.08 },
};

const DEFAULT_PRICING = { input: 3, output: 15 };

export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = PRICING[model] ?? DEFAULT_PRICING;
  return (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
}
