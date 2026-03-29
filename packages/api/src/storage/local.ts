import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { StorageAdapter } from "./adapter.js";

export class LocalStorage implements StorageAdapter {
  constructor(private baseDir: string) {
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }
  }

  private resolve(key: string): string {
    return join(this.baseDir, key);
  }

  async put(key: string, data: Buffer): Promise<void> {
    const path = this.resolve(key);
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(path, data);
  }

  async get(key: string): Promise<Buffer | null> {
    const path = this.resolve(key);
    if (!existsSync(path)) return null;
    return readFileSync(path);
  }

  async delete(key: string): Promise<void> {
    const path = this.resolve(key);
    if (existsSync(path)) {
      rmSync(path);
    }
  }

  async exists(key: string): Promise<boolean> {
    return existsSync(this.resolve(key));
  }
}
