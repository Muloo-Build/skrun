export interface AssertResult {
  pass: boolean;
  detail: string;
}

const ASSERT_REGEX = /^output\.([a-zA-Z0-9_.]+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/;

function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  let current: unknown = obj;
  for (const key of path.split(".")) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function parseValue(raw: string): unknown {
  const trimmed = raw.trim();

  // Quoted string
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Boolean
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  // Null/undefined
  if (trimmed === "null") return null;
  if (trimmed === "undefined") return undefined;

  // Number
  const num = Number(trimmed);
  if (!Number.isNaN(num)) return num;

  // Fallback: treat as string
  return trimmed;
}

function compare(actual: unknown, op: string, expected: unknown): boolean {
  switch (op) {
    case "==":
      // biome-ignore lint/suspicious/noDoubleEquals: intentional loose comparison for assertion evaluator
      return actual == expected;
    case "!=":
      // biome-ignore lint/suspicious/noDoubleEquals: intentional loose comparison for assertion evaluator
      return actual != expected;
    case ">=":
      return Number(actual) >= Number(expected);
    case "<=":
      return Number(actual) <= Number(expected);
    case ">":
      return Number(actual) > Number(expected);
    case "<":
      return Number(actual) < Number(expected);
    default:
      return false;
  }
}

export function evalAssert(expression: string, output: Record<string, unknown>): AssertResult {
  const match = expression.match(ASSERT_REGEX);

  if (!match) {
    return {
      pass: false,
      detail: `Invalid assertion syntax: "${expression}". Expected: output.field <op> <value>`,
    };
  }

  const [, path, op, rawExpected] = match;
  const actual = resolvePath(output, path);
  const expected = parseValue(rawExpected);
  const pass = compare(actual, op, expected);

  return {
    pass,
    detail: pass
      ? `output.${path} ${op} ${rawExpected}`
      : `Expected: output.${path} ${op} ${rawExpected}, got: ${JSON.stringify(actual)}`,
  };
}
