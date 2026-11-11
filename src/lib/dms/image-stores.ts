import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ImageStore } from "./easycars-images";

/** Vercel Blob (needs BLOB_READ_WRITE_TOKEN). Keys are content-hashed, so overwriting is a no-op and caching can be long. */
export class VercelBlobStore implements ImageStore {
  async put(key: string, data: Buffer, contentType: string) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, data, { access: "public", contentType, addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 31_536_000 });
    return blob.url;
  }
}

/** Writes under ./public so photos are served by the dev server. For local development only — not for Vercel. */
export class LocalDiskStore implements ImageStore {
  constructor(private root = join(process.cwd(), "public", "stock")) {}
  async put(key: string, data: Buffer) {
    const path = join(this.root, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
    return `/stock/${key}`;
  }
}

/** `IMAGE_STORE=local` for development; otherwise Vercel Blob. */
export function getImageStore(env: NodeJS.ProcessEnv = process.env): ImageStore {
  if (env.IMAGE_STORE === "local") return new LocalDiskStore();
  if (!env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not set (or set IMAGE_STORE=local for development)");
  return new VercelBlobStore();
}
