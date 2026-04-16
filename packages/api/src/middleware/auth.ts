import { createHash } from "node:crypto";
import type { Context, MiddlewareHandler } from "hono";
import type { UserContext } from "../types.js";

const USER_CONTEXT_KEY = "user";

export function parseBearerToken(header?: string): string | null {
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice(7).trim();
  return token || null;
}

export function authenticateToken(token: string): UserContext | null {
  const configuredToken = process.env.SKRUN_API_TOKEN?.trim();
  if (configuredToken && token !== configuredToken) {
    return null;
  }

  const namespace = configuredToken
    ? (process.env.SKRUN_NAMESPACE?.trim() ?? "muloo")
    : token === "dev-token"
      ? "dev"
      : token.split("-")[0] || "user";

  const id = createHash("sha256").update(`${namespace}:${token}`).digest("hex").slice(0, 16);
  return { id, namespace };
}

export function authenticateBearerHeader(
  header?: string,
): { token: string; user: UserContext } | null {
  const token = parseBearerToken(header);
  if (!token) {
    return null;
  }

  const user = authenticateToken(token);
  if (!user) {
    return null;
  }

  return { token, user };
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const auth = authenticateBearerHeader(c.req.header("Authorization"));
  if (!auth) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid Authorization header. Use: Bearer <token>",
        },
      },
      401,
    );
  }

  c.set(USER_CONTEXT_KEY, auth.user);

  await next();
};

export function getUser(c: Context): UserContext {
  return c.get(USER_CONTEXT_KEY) as UserContext;
}
