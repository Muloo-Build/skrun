import { z } from "zod";

export const RuntimeConfigSchema = z.object({
  timeout: z
    .string()
    .regex(/^\d+s$/, 'Timeout must be in seconds (e.g., "300s")')
    .default("300s"),
  max_cost: z.number().positive("max_cost must be positive").optional(),
  sandbox: z.enum(["strict", "permissive"]).default("strict"),
});

export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;
