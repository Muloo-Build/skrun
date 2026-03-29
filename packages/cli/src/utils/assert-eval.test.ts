import { describe, expect, it } from "vitest";
import { evalAssert } from "./assert-eval.js";

describe("evalAssert", () => {
  it("should pass: output.score >= 0", () => {
    const result = evalAssert("output.score >= 0", { score: 5 });
    expect(result.pass).toBe(true);
  });

  it("should fail: output.score >= 0 when undefined", () => {
    const result = evalAssert("output.score >= 0", {});
    expect(result.pass).toBe(false);
    expect(result.detail).toContain("undefined");
  });

  it('should pass: output.status == "success"', () => {
    const result = evalAssert('output.status == "success"', { status: "success" });
    expect(result.pass).toBe(true);
  });

  it('should fail: output.status == "error" when ok', () => {
    const result = evalAssert('output.status == "error"', { status: "ok" });
    expect(result.pass).toBe(false);
    expect(result.detail).toContain('"ok"');
  });

  it("should handle nested paths: output.data.count > 10", () => {
    const result = evalAssert("output.data.count > 10", { data: { count: 15 } });
    expect(result.pass).toBe(true);
  });

  it("should handle != operator", () => {
    const result = evalAssert('output.status != "failed"', { status: "ok" });
    expect(result.pass).toBe(true);
  });

  it("should handle <= operator", () => {
    const result = evalAssert("output.score <= 100", { score: 85 });
    expect(result.pass).toBe(true);
  });

  it("should handle < operator", () => {
    const result = evalAssert("output.count < 5", { count: 3 });
    expect(result.pass).toBe(true);
  });

  it("should return fail for invalid expression", () => {
    const result = evalAssert("not a valid expression", { score: 5 });
    expect(result.pass).toBe(false);
    expect(result.detail).toContain("Invalid assertion syntax");
  });

  it("should handle boolean comparison", () => {
    const result = evalAssert("output.valid == true", { valid: true });
    expect(result.pass).toBe(true);
  });
});
