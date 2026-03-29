import { z } from "zod";

const SKILL_NAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export const SkillFrontmatterSchema = z.object({
  name: z
    .string()
    .min(1, "Skill name is required")
    .max(64, "Skill name must be 64 characters or fewer")
    .regex(SKILL_NAME_REGEX, "Skill name must be lowercase alphanumeric with hyphens only")
    .refine((s) => !s.includes("--"), "Skill name must not contain consecutive hyphens"),
  description: z
    .string()
    .min(1, "Skill description is required")
    .max(1024, "Skill description must be 1024 characters or fewer"),
  license: z.string().optional(),
  compatibility: z.string().max(500, "Compatibility must be 500 characters or fewer").optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  "allowed-tools": z.string().optional(),
});

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
