import { z } from "zod";

export const PermissionsSchema = z.object({
  network: z.array(z.string()).default([]),
  filesystem: z.enum(["none", "read-only", "read-write"]).default("read-only"),
  secrets: z.array(z.string()).default([]),
});

export type Permissions = z.infer<typeof PermissionsSchema>;
