import "server-only";
import { eq, inArray } from "drizzle-orm";
import { stockOverrides } from "@/content/stock-overrides";
import { syncState, vehicles } from "@/db/schema";
import { decodeCsv, type ParsedFeed, parseEasyCarsCsv } from "./easycars-csv";
import { earliestPhotoDate, groupImages, type ImageManifestEntry, type ImageStore, planImages, storeImage } from "./easycars-images";
import { type Db, type StockItem, upsertStock } from "./sync";
import { type StockTransport, TransportError } from "./transport";

export type EasyCarsOptions = {
  /** Paths relative to the FTP login directory. */
  csvPath: string;
  imagesDir: string;
  /** Most photo downloads in one run; the rest are picked up next run. `Infinity` for the first backfill. */
  maxImages?: number;
  /** Parse and plan only: nothing is written to the database or photo storage. */
  dryRun?: boolean;
  /** How long to wait before re-reading a feed file that changed mid-download. */
  retryDelayMs?: number;
  now?: Date;
  log?: (message: string) => void;
};

export type EasyCarsReport = {
  adapter: "easycars-ftp";
  dryRun: boolean;
  csvModifiedAt: string;
  /** The feed file is the one already processed, so stock was not rewritten (photos are still caught up). */
  csvUnchanged: boolean;
  received: number;
  upserted: number;
  markedSold: number;
  invalidRows: number;
  imagesUploaded: number;
  /** Photos already stored and unchanged on the server. */
  imagesSkipped: number;
  /** Photos still to copy because this run hit its cap or a download failed. */
  imagesPending: number;
  warnings: string[];
  /** Dry runs only: what would be written. */
  vehicles?: StockItem[];
};

const STATE_KEY = "easycars";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Download the feed, guarding against catching EasyCars (or a manual send by staff) part-way through writing it:
 * the size is checked before and after, and the bytes received must match. One retry, then the run is abandoned.
 */
export async function readFeed(transport: StockTransport, csvPath: string, retryDelayMs: number): Promise<{ feed: ParsedFeed; modifiedAt: Date; size: number }> {
  for (let attempt = 1; ; attempt++) {
    const before = await transport.stat(csvPath);
    const bytes = await transport.download(csvPath);
    const after = await transport.stat(csvPath);
    const stable = before.size === after.size && bytes.length === after.size && before.modifiedAt.getTime() === after.modifiedAt.getTime();
    if (stable) return { feed: parseEasyCarsCsv(decodeCsv(bytes)), modifiedAt: after.modifiedAt, size: after.size };
    if (attempt === 2) throw new Error("EasyCars CSV kept changing while it was being read — leaving stock untouched until the next run");
    await sleep(retryDelayMs);
  }
}

/**
 * One EasyCars sync over a single FTP session:
 * 1. read and validate the CSV snapshot (abort, changing nothing, on any problem);
 * 2. list the photo folder once;
 * 3. upsert stock and mark missing cars sold — skipped when the file is the one already processed;
 * 4. copy new or changed photos for in-feed cars into permanent storage, up to `maxImages`.
 * The caller owns the transport (and closes it) and refreshes cached pages afterwards.
 */
export async function runEasyCarsSync(db: Db, transport: StockTransport, store: ImageStore, options: EasyCarsOptions): Promise<EasyCarsReport> {
  const { csvPath, imagesDir, maxImages = 150, dryRun = false, retryDelayMs = 20_000, now = new Date(), log = console.log } = options;
  const warnings: string[] = [];

  const { feed, modifiedAt, size } = await readFeed(transport, csvPath, retryDelayMs);
  for (const bad of feed.invalid) warnings.push(`row ${bad.row}${bad.stockNumber ? ` (stock ${bad.stockNumber})` : ""} skipped: ${bad.problem}`);
  if (feed.duplicates.length) warnings.push(`duplicate stock numbers, last row kept: ${feed.duplicates.join(", ")}`);
  if (feed.milesFromDescription.length) warnings.push(`odometer read as miles from the write-up (IsMiles not set in EasyCars): ${feed.milesFromDescription.join(", ")}`);

  const photos = groupImages(await transport.list(imagesDir));
  const stock: StockItem[] = feed.vehicles.map((v) => ({
    ...v,
    ...stockOverrides[v.id],
    // The feed has no stock-in date; a car's first photos are the best signal of when it arrived.
    arrivedAt: (earliestPhotoDate(photos.get(v.id), now) ?? now).toISOString(),
    images: [],
  }));
  const ids = stock.map((v) => v.id);

  const [state] = await db.select().from(syncState).where(eq(syncState.key, STATE_KEY)).limit(1);
  const csvUnchanged = state?.value.csvModifiedAt === modifiedAt.toISOString() && state?.value.csvSize === size;

  const report: EasyCarsReport = {
    adapter: "easycars-ftp",
    dryRun,
    csvModifiedAt: modifiedAt.toISOString(),
    csvUnchanged,
    received: stock.length,
    upserted: 0,
    markedSold: 0,
    invalidRows: feed.invalid.length,
    imagesUploaded: 0,
    imagesSkipped: 0,
    imagesPending: 0,
    warnings,
  };

  if (!dryRun && !csvUnchanged) Object.assign(report, await upsertStock(db, stock, { keepImages: true, raw: feed.raw }));

  // Photos. Cars with nothing stored yet go first, so a new arrival is never left bare by the cap.
  const storedRows = await db.select({ id: vehicles.id, manifest: vehicles.imageManifest }).from(vehicles).where(inArray(vehicles.id, ids));
  const stored = new Map(storedRows.map((r) => [r.id, r.manifest]));
  const queue = [...ids].sort((a, b) => (stored.get(a)?.length ? 1 : 0) - (stored.get(b)?.length ? 1 : 0));
  let failuresInARow = 0;

  for (const id of queue) {
    const have = stored.get(id) ?? [];
    const plan = planImages(have, photos.get(id));
    if (plan === "keep-stored") {
      report.imagesSkipped += have.length;
      continue;
    }
    report.imagesSkipped += plan.keep.length;
    if (dryRun) {
      report.imagesPending += plan.fetch.length;
      continue;
    }

    const fetched = new Map<number, ImageManifestEntry>();
    for (const file of plan.fetch) {
      if (report.imagesUploaded >= maxImages || failuresInARow >= 3) break;
      try {
        fetched.set(file.index, await storeImage(transport, store, imagesDir, id, file));
        report.imagesUploaded++;
        failuresInARow = 0;
      } catch (err) {
        failuresInARow++;
        warnings.push(`photo ${file.name} not copied: ${(err as Error).message}`);
      }
    }
    report.imagesPending += plan.fetch.length - fetched.size;

    // The gallery follows the server's order. A photo still waiting to be copied keeps its previous version, if any.
    const previous = new Map(have.map((e) => [e.index, e]));
    const kept = new Map(plan.keep.map((e) => [e.index, e]));
    const manifest = (photos.get(id) ?? [])
      .map((file) => fetched.get(file.index) ?? kept.get(file.index) ?? previous.get(file.index))
      .filter((e): e is ImageManifestEntry => e !== undefined);
    const changed = fetched.size > 0 || manifest.length !== have.length;
    if (changed) await db.update(vehicles).set({ imageManifest: manifest, images: manifest.map((e) => e.url), updatedAt: now }).where(eq(vehicles.id, id));
  }
  if (failuresInARow >= 3) warnings.push("photo copying stopped after 3 failures in a row; it resumes next run");

  if (dryRun) report.vehicles = stock;
  else {
    const value = { csvModifiedAt: modifiedAt.toISOString(), csvSize: size, at: now.toISOString() };
    await db.insert(syncState).values({ key: STATE_KEY, value }).onConflictDoUpdate({ target: syncState.key, set: { value, updatedAt: now } });
  }
  log(`[easycars] ${dryRun ? "dry run: " : ""}${report.received} cars, ${report.upserted} written, ${report.markedSold} sold, photos +${report.imagesUploaded} / ${report.imagesPending} pending`);
  return report;
}

export { TransportError };
