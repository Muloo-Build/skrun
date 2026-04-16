const ALLOWED_OBJECT_TYPES = ["contacts", "companies", "deals", "tickets"] as const;
const ALLOWED_AUDIT_FOCUS = ["properties", "pipelines", "lifecycle", "governance"] as const;

type AllowedObjectType = (typeof ALLOWED_OBJECT_TYPES)[number];
type AllowedAuditFocus = (typeof ALLOWED_AUDIT_FOCUS)[number];

export interface HubSpotCrmAuditInput {
  portalId: string;
  objectTypes: AllowedObjectType[];
  auditFocus: AllowedAuditFocus[];
}

export interface HubSpotCrmAuditResult {
  summary: string;
  issues: Array<{
    id: string;
    severity: "low" | "medium" | "high";
    area: AllowedAuditFocus;
    title: string;
    detail: string;
  }>;
  risks: Array<{
    severity: "low" | "medium" | "high";
    title: string;
    detail: string;
  }>;
  recommendations: Array<{
    priority: "now" | "next" | "later";
    action: string;
    detail: string;
  }>;
  estimated_effort: {
    level: "low" | "medium";
    hours: string;
    assumptions: string[];
  };
  next_steps: string[];
}

function normalizeSelections<T extends string>(
  raw: unknown,
  allowed: readonly T[],
  fallback: readonly T[],
): T[] {
  if (!Array.isArray(raw)) {
    return [...fallback];
  }

  const allowedValues = new Set(allowed);
  return raw.filter(
    (value): value is T => typeof value === "string" && allowedValues.has(value as T),
  );
}

export function validateHubSpotCrmAuditInput(
  input: unknown,
): { ok: true; value: HubSpotCrmAuditInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "input must be an object" };
  }

  const candidate = input as Record<string, unknown>;
  if (typeof candidate.portalId !== "string" || !candidate.portalId.trim()) {
    return { ok: false, error: "input.portalId is required and must be a string" };
  }

  const objectTypes = normalizeSelections(
    candidate.objectTypes,
    ALLOWED_OBJECT_TYPES,
    ALLOWED_OBJECT_TYPES,
  );
  if (objectTypes.length === 0) {
    return {
      ok: false,
      error: `input.objectTypes must include at least one of: ${ALLOWED_OBJECT_TYPES.join(", ")}`,
    };
  }

  const auditFocus = normalizeSelections(
    candidate.auditFocus,
    ALLOWED_AUDIT_FOCUS,
    ALLOWED_AUDIT_FOCUS,
  );
  if (auditFocus.length === 0) {
    return {
      ok: false,
      error: `input.auditFocus must include at least one of: ${ALLOWED_AUDIT_FOCUS.join(", ")}`,
    };
  }

  return {
    ok: true,
    value: {
      portalId: candidate.portalId.trim(),
      objectTypes,
      auditFocus,
    },
  };
}

export function runHubSpotCrmAudit(
  input: HubSpotCrmAuditInput,
  context: { tenantId: string },
): HubSpotCrmAuditResult {
  const objectList = input.objectTypes.join(", ");
  const focusList = input.auditFocus.join(", ");

  const issues: HubSpotCrmAuditResult["issues"] = [];

  if (input.auditFocus.includes("properties")) {
    issues.push({
      id: "property-catalog-review",
      severity: "medium",
      area: "properties",
      title: "Property catalogue should be reviewed for overlap and drift",
      detail: `Read-only audit stub queued for ${objectList}. Focus on duplicate labels, near-duplicate internal names, and unused custom properties before exposing this to client teams.`,
    });
  }

  if (input.auditFocus.includes("pipelines")) {
    issues.push({
      id: "pipeline-consistency-review",
      severity: "medium",
      area: "pipelines",
      title: "Pipeline stages should be checked for inconsistent stage semantics",
      detail:
        "Review deal and ticket pipelines for stages that mean the same thing in practice but are named differently across teams, which tends to break reporting and automation.",
    });
  }

  if (input.auditFocus.includes("lifecycle")) {
    issues.push({
      id: "lifecycle-definition-review",
      severity: "high",
      area: "lifecycle",
      title: "Lifecycle and deal stage definitions likely need a governance pass",
      detail:
        "Map lifecycle stage usage against the commercial process to catch skipped stages, recycled deals, and ambiguous qualification rules before downstream dashboards are trusted.",
    });
  }

  if (input.auditFocus.includes("governance")) {
    issues.push({
      id: "governance-controls-review",
      severity: "medium",
      area: "governance",
      title: "Operational ownership and change control should be formalized",
      detail:
        "Set clear ownership for schema changes, document naming conventions, and require human approval before any future write-enabled clean-up workflow is allowed.",
    });
  }

  return {
    summary: `Read-only HubSpot CRM audit prepared for tenant ${context.tenantId} on portal ${input.portalId}. This MVP stub scopes ${objectList} across ${focusList} and returns planning-grade findings without making HubSpot API calls.`,
    issues,
    risks: [
      {
        severity: "high",
        title: "Schema drift can undermine reporting confidence",
        detail:
          "If overlapping properties and inconsistent stage usage are left unresolved, RevOps reporting and AI automations will produce noisy or contradictory outputs.",
      },
      {
        severity: "medium",
        title: "Write access should remain disabled until review controls exist",
        detail:
          "This skill is intentionally read-only. Any future create, update, or delete actions should require explicit human approval and change tracking.",
      },
    ],
    recommendations: [
      {
        priority: "now",
        action: "Fetch and inventory HubSpot metadata only",
        detail:
          "Implement read-only collection of properties, pipelines, and object metadata first so the audit can produce evidence-backed findings before any remediation workflow is considered.",
      },
      {
        priority: "next",
        action: "Define canonical lifecycle and stage semantics",
        detail:
          "Agree one business-owned definition set for lifecycle stages, deal stages, and ticket stages so duplicate meanings can be consolidated safely.",
      },
      {
        priority: "later",
        action: "Introduce approval-gated remediation playbooks",
        detail:
          "When the audit is stable, add optional clean-up playbooks that propose changes, capture approval, and only then allow controlled writes back to HubSpot.",
      },
    ],
    estimated_effort: {
      level: "medium",
      hours: "8-16",
      assumptions: [
        "HubSpot authentication details are available to the backend only.",
        "The first production pass remains metadata-only and read-only.",
        "Muloo will review findings with the client before any remediation workflow is enabled.",
      ],
    },
    next_steps: [
      "Wire the skill to read HubSpot properties, pipelines, and object metadata using backend-only credentials.",
      "Add duplicate-property heuristics and lifecycle-stage consistency rules backed by structured evidence.",
      "Keep all HubSpot write actions disabled until a human approval flow is designed.",
    ],
  };
}
