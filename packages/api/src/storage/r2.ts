import type { StorageAdapter } from "./adapter.js";

/**
 * R2 Storage adapter — functional only in Cloudflare Workers environment.
 * Stub implementation for type-checking and build validation.
 */
export class R2Storage implements StorageAdapter {
  async put(_key: string, _data: Buffer): Promise<void> {
    throw new Error("R2Storage is only available in Cloudflare Workers environment");
  }

  async get(_key: string): Promise<Buffer | null> {
    throw new Error("R2Storage is only available in Cloudflare Workers environment");
  }

  async delete(_key: string): Promise<void> {
    throw new Error("R2Storage is only available in Cloudflare Workers environment");
  }

  async exists(_key: string): Promise<boolean> {
    throw new Error("R2Storage is only available in Cloudflare Workers environment");
  }
}
