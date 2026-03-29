export interface ValidationIssue {
  code: string;
  message: string;
  file?: string;
  field?: string;
}

export class SkrunError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = "SkrunError";
    this.code = code;
    this.cause = cause;
  }
}

export class ValidationError extends SkrunError {
  readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[], cause?: unknown) {
    super("VALIDATION_FAILED", message, cause);
    this.name = "ValidationError";
    this.issues = issues;
  }
}
