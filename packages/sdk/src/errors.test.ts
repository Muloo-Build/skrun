import { describe, expect, it } from "vitest";
import { SkrunApiError } from "./errors.js";

describe("SkrunApiError", () => {
  it("is an instance of Error", () => {
    const err = new SkrunApiError("NOT_FOUND", "Agent not found", 404);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(SkrunApiError);
  });

  it("has code, message, and status", () => {
    const err = new SkrunApiError("UNAUTHORIZED", "Missing token", 401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Missing token");
    expect(err.status).toBe(401);
    expect(err.name).toBe("SkrunApiError");
  });

  it("fromResponse parses server error format", async () => {
    const response = new Response(
      JSON.stringify({ error: { code: "NOT_FOUND", message: "Agent not found" } }),
      { status: 404, statusText: "Not Found" },
    );
    const err = await SkrunApiError.fromResponse(response);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Agent not found");
    expect(err.status).toBe(404);
  });

  it("fromResponse handles non-JSON response", async () => {
    const response = new Response("Internal Server Error", {
      status: 500,
      statusText: "Internal Server Error",
    });
    const err = await SkrunApiError.fromResponse(response);
    expect(err.code).toBe("UNKNOWN");
    expect(err.status).toBe(500);
  });

  it("networkError creates error with code NETWORK_ERROR", () => {
    const err = SkrunApiError.networkError("http://localhost:4000");
    expect(err.code).toBe("NETWORK_ERROR");
    expect(err.message).toContain("localhost:4000");
    expect(err.status).toBe(0);
  });

  it("timeout creates error with code TIMEOUT", () => {
    const err = SkrunApiError.timeout(5000);
    expect(err.code).toBe("TIMEOUT");
    expect(err.message).toContain("5000ms");
  });

  it("streamInterrupted creates error with code STREAM_INTERRUPTED", () => {
    const err = SkrunApiError.streamInterrupted();
    expect(err.code).toBe("STREAM_INTERRUPTED");
  });
});
