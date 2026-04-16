import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { authenticateBearerHeader } from "../middleware/auth.js";
import {
  runHubSpotCrmAudit,
  validateHubSpotCrmAuditInput,
} from "../muloo/skills/hubspot-crm-audit.js";

const APPROVED_SKILLS = new Set(["hubspot-crm-audit"]);

export function createGatewayRoutes(): Hono {
  const router = new Hono();

  router.post("/run", async (c) => {
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

    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: { code: "INVALID_REQUEST", message: "Invalid JSON body" } }, 400);
    }

    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const skill = typeof body.skill === "string" ? body.skill.trim() : "";
    const input = body.input;

    if (!tenantId) {
      return c.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "tenantId is required and must be a string",
          },
        },
        400,
      );
    }

    if (!skill || !APPROVED_SKILLS.has(skill)) {
      return c.json(
        {
          error: {
            code: "SKILL_NOT_ALLOWED",
            message: `Only approved skills are allowed: ${[...APPROVED_SKILLS].join(", ")}`,
          },
        },
        400,
      );
    }

    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return c.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "input is required and must be an object",
          },
        },
        400,
      );
    }

    const requestId = randomUUID();
    console.info("[MulooGateway] run requested", {
      requestId,
      tenantId,
      skill,
      namespace: auth.user.namespace,
    });

    if (skill === "hubspot-crm-audit") {
      const validated = validateHubSpotCrmAuditInput(input);
      if (!validated.ok) {
        return c.json(
          {
            error: {
              code: "INVALID_REQUEST",
              message: validated.error,
            },
          },
          400,
        );
      }

      const result = runHubSpotCrmAudit(validated.value, { tenantId });
      return c.json({
        ok: true,
        requestId,
        tenantId,
        skill,
        result,
      });
    }

    return c.json(
      {
        error: {
          code: "SKILL_NOT_ALLOWED",
          message: "Unsupported skill",
        },
      },
      400,
    );
  });

  return router;
}
