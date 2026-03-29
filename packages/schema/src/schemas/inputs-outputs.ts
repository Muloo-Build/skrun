import { z } from "zod";

const FIELD_TYPES = ["string", "number", "boolean", "object", "array"] as const;

export const InputFieldSchema = z.object({
  name: z.string().min(1, "Input name is required"),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().default(true),
  description: z.string().optional(),
  default: z.unknown().optional(),
});

export const OutputFieldSchema = z.object({
  name: z.string().min(1, "Output name is required"),
  type: z.enum(FIELD_TYPES),
  description: z.string().optional(),
});

export type InputField = z.infer<typeof InputFieldSchema>;
export type OutputField = z.infer<typeof OutputFieldSchema>;
