import { SkrunError } from "@skrun-dev/schema";

export class TimeoutError extends SkrunError {
  constructor(timeoutMs: number) {
    super("TIMEOUT", `Execution timed out after ${timeoutMs / 1000}s`);
    this.name = "TimeoutError";
  }
}

export function parseTimeout(timeout: string): number {
  const match = timeout.match(/^(\d+)s$/);
  if (!match) throw new Error(`Invalid timeout format: "${timeout}". Expected "Ns" (e.g., "300s")`);
  return Number.parseInt(match[1], 10) * 1000;
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
