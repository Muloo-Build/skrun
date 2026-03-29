import { createHash } from "node:crypto";
import type { Context, MiddlewareHandler } from "hono";
import type { UserContext } from "../types.js";

const USER_CONTEXT_KEY = "user";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
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

  const token = header.slice(7).trim();
  if (!token) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Empty token" } }, 401);
  }

  // MVP dev mode: derive user from token
  const namespace = token === "dev-token" ? "dev" : token.split("-")[0] || "user";
  const id = createHash("sha256").update(token).digest("hex").slice(0, 16);

  const user: UserContext = { id, namespace };
  c.set(USER_CONTEXT_KEY, user);

  await next();
};

export function getUser(c: Context): UserContext {
  return c.get(USER_CONTEXT_KEY) as UserContext;
}
