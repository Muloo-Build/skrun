import { z } from "zod";

export const StateConfigSchema = z.object({
  type: z.enum(["kv", "none"]).default("kv"),
  ttl: z
    .string()
    .regex(/^\d+d$/, 'TTL must be in days (e.g., "30d")')
    .default("30d"),
});

export type StateConfig = z.infer<typeof StateConfigSchema>;
