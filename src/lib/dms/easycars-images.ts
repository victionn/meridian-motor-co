import { createHash } from "node:crypto";
import type { RemoteFile, StockTransport } from "./transport";

/** One stored photo: where it came from on the stock server (to detect changes) and where it now lives. */
export type ImageManifestEntry = { index: number; ftpSize: number; ftpModified: string; url: string };

/** Permanent photo storage. Vercel Blob in production; swap the class for S3/R2. */
export interface ImageStore {
  /** Store the bytes under `key` and return the public URL. Re-putting an existing key must be harmless. */
  put(key: string, data: Buffer, contentType: string): Promise<string>;
}

const PHOTO = /^(.+)_(\d+)\.jpe?g$/i;

/** Group the photo folder by stock number, each car's photos in index order (gaps are fine: _1, _2, _5). */
export function groupImages(files: RemoteFile[]): Map<string, (RemoteFile & { index: number })[]> {
  const groups = new Map<string, (RemoteFile & { index: number })[]>();
  for (const file of files) {
    const m = PHOTO.exec(file.name);
    if (!m) continue;
    const list = groups.get(m[1]) ?? [];
    list.push({ ...file, index: Number(m[2]) });
    groups.set(m[1], list);
  }
  for (const list of groups.values()) list.sort((a, b) => a.index - b.index);
  return groups;
}

export type ImagePlan = {
  /** Photos already stored and unchanged on the server. */
  keep: ImageManifestEntry[];
  /** Photos that are new or whose size/date changed on the server. */
  fetch: (RemoteFile & { index: number })[];
};

/**
 * Decide what to do for one car. No files on the server is NOT "no photos": the server may have purged them
 * (it is meant to after 7 days), so the stored set is kept as it is. When files are present they are the truth:
 * anything no longer listed drops out of the car's gallery.
 */
export function planImages(stored: ImageManifestEntry[], onServer: (RemoteFile & { index: number })[] | undefined): ImagePlan | "keep-stored" {
  if (!onServer || onServer.length === 0) return "keep-stored";
  const byIndex = new Map(stored.map((e) => [e.index, e]));
  const plan: ImagePlan = { keep: [], fetch: [] };
  for (const file of onServer) {
    const have = byIndex.get(file.index);
    if (have && have.ftpSize === file.size && have.ftpModified === file.modified) plan.keep.push(have);
    else plan.fetch.push(file);
  }
  return plan;
}

/** `vehicles/13171/1-3fa9c2d1.jpg` — the hash makes a changed photo a new URL, so long cache lifetimes are safe. */
export const imageKey = (stockNumber: string, index: number, data: Buffer) =>
  `vehicles/${stockNumber}/${index}-${createHash("sha256").update(data).digest("hex").slice(0, 8)}.jpg`;

/** Earliest date among a car's photos, used as its arrival date (the feed has no stock-in date). */
export function earliestPhotoDate(files: RemoteFile[] | undefined, now = new Date()): Date | undefined {
  const dates = (files ?? []).map((f) => parseListingDate(f.modified, now)).filter((d): d is Date => d !== undefined);
  return dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : undefined;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * Parse a directory-listing date. Unix listings print "Feb 08 2026" for older files and "Jul 29 05:01" (no year)
 * for files from roughly the last six months; a year-less date that would land in the future belongs to last year.
 */
export function parseListingDate(text: string, now = new Date()): Date | undefined {
  const iso = /^\d{4}-\d{2}-\d{2}T/.test(text) ? new Date(text) : undefined;
  if (iso && !Number.isNaN(iso.getTime())) return iso;
  const m = /^([A-Za-z]{3})\s+(\d{1,2})\s+(?:(\d{4})|(\d{1,2}):(\d{2}))$/.exec(text.trim());
  if (!m) return undefined;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  if (month < 0) return undefined;
  if (m[3]) return new Date(Date.UTC(Number(m[3]), month, Number(m[2])));
  const date = new Date(Date.UTC(now.getUTCFullYear(), month, Number(m[2]), Number(m[4]), Number(m[5])));
  if (date.getTime() > now.getTime() + 36 * 3600 * 1000) date.setUTCFullYear(date.getUTCFullYear() - 1);
  return date;
}

/** Download one photo and put it in permanent storage. */
export async function storeImage(transport: StockTransport, store: ImageStore, dir: string, stockNumber: string, file: RemoteFile & { index: number }): Promise<ImageManifestEntry> {
  const data = await transport.download(`${dir.replace(/\/$/, "")}/${file.name}`);
  if (data.length === 0) throw new Error(`${file.name} downloaded empty`);
  const url = await store.put(imageKey(stockNumber, file.index, data), data, "image/jpeg");
  return { index: file.index, ftpSize: file.size, ftpModified: file.modified, url };
}
