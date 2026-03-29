import { z } from "zod";

export const TestCaseSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  input: z.record(z.string(), z.unknown()),
  assert: z.string().min(1, "Test assertion expression is required"),
});

export type TestCase = z.infer<typeof TestCaseSchema>;
