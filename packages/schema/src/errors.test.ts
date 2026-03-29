import { describe, expect, it } from "vitest";
import { SkrunError, ValidationError } from "./errors.js";

describe("SkrunError", () => {
  it("should have code, message, and name", () => {
    const err = new SkrunError("TEST_ERROR", "something went wrong");
    expect(err.code).toBe("TEST_ERROR");
    expect(err.message).toBe("something went wrong");
    expect(err.name).toBe("SkrunError");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(SkrunError);
  });

  it("should support a cause", () => {
    const cause = new Error("root cause");
    const err = new SkrunError("TEST_ERROR", "wrapper", cause);
    expect(err.cause).toBe(cause);
  });
});

describe("ValidationError", () => {
  it("should have code VALIDATION_FAILED and issues", () => {
    const issues = [
      { code: "MISSING_FIELD", message: "name is required", field: "name" },
      { code: "INVALID_TYPE", message: "version must be string", field: "version" },
    ];
    const err = new ValidationError("Invalid agent config", issues);
    expect(err.code).toBe("VALIDATION_FAILED");
    expect(err.name).toBe("ValidationError");
    expect(err.message).toBe("Invalid agent config");
    expect(err.issues).toHaveLength(2);
    expect(err.issues[0].code).toBe("MISSING_FIELD");
    expect(err.issues[1].field).toBe("version");
  });

  it("should be instanceof SkrunError and Error", () => {
    const err = new ValidationError("test", []);
    expect(err).toBeInstanceOf(SkrunError);
    expect(err).toBeInstanceOf(Error);
  });

  it("should support file in issues", () => {
    const issues = [{ code: "MISSING_FILE", message: "SKILL.md not found", file: "SKILL.md" }];
    const err = new ValidationError("missing file", issues);
    expect(err.issues[0].file).toBe("SKILL.md");
  });
});
