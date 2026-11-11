import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import FtpSrv from "ftp-srv";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/db/schema";
import type { ImageStore } from "../easycars-images";
import { type EasyCarsOptions, runEasyCarsSync } from "../easycars-sync";
import type { Db } from "../sync";
import { FtpTransport, TransportError } from "../transport";

/**
 * End to end against a real FTP server (in-process) and a real Postgres engine (PGlite, with the project's own
 * migrations): the same code path the cron route runs, minus Vercel Blob.
 */
const FIXTURE = new URL("../__fixtures__/easycars-sample.csv", import.meta.url);
const PORT = 21000 + Math.floor(Math.random() * 2000);
const PASSWORD = "s3cret-pass";
const { vehicles, syncState } = schema;

let root: string;
let server: FtpSrv;
let db: Db;
let uploads: string[];
const store: ImageStore = {
  async put(key) {
    uploads.push(key);
    return `https://photos.test/${key}`;
  },
};
const options: EasyCarsOptions = { csvPath: "meridianwholesale.csv", imagesDir: "images", retryDelayMs: 10, log: () => {} };

const photo = (name: string, content: string, mtime = new Date("2026-03-01T00:00:00Z")) => {
  writeFileSync(join(root, "images", name), content);
  utimesSync(join(root, "images", name), mtime, mtime);
};
const resetServerFiles = () => {
  rmSync(join(root, "images"), { recursive: true, force: true });
  mkdirSync(join(root, "images"));
  cpSync(FIXTURE, join(root, "meridianwholesale.csv"));
  photo("13441_1.jpg", "golf-front");
  photo("13441_2.jpg", "golf-rear");
  photo("13441_5.jpg", "golf-interior"); // gap in the numbering
  photo("13171_1.jpg", "testarossa", new Date("2025-07-29T00:00:00Z"));
  photo("99999_1.jpg", "not-in-feed");
};
const sync = async (extra: Partial<EasyCarsOptions> = {}, port = PORT) => {
  const transport = new FtpTransport({ host: "127.0.0.1", port, user: "mmc", password: PASSWORD, timeoutMs: 3000 });
  try {
    return await runEasyCarsSync(db, transport, store, { ...options, ...extra });
  } finally {
    transport.close();
  }
};
const row = async (id: string) => (await db.select().from(vehicles).where(eq(vehicles.id, id)))[0];
/** Rewrite the feed file on the server with some rows dropped or changed. */
const rewriteCsv = (change: (lines: string[]) => string[]) => {
  const lines = readFileSync(FIXTURE, "utf8").trimEnd().split("\r\n");
  writeFileSync(join(root, "meridianwholesale.csv"), `${change(lines).join("\r\n")}\r\n`);
};

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "easycars-ftp-"));
  server = new FtpSrv({ url: `ftp://127.0.0.1:${PORT}`, pasv_url: "127.0.0.1", anonymous: false, log: { info() {}, warn() {}, error() {}, debug() {}, trace() {}, fatal() {}, child() { return this; } } as never });
  server.on("login", ({ username, password }, resolve, reject) => (username === "mmc" && password === PASSWORD ? resolve({ root }) : reject(new Error("bad login"))));
  await server.listen();
});
afterAll(async () => {
  await server.close();
  rmSync(root, { recursive: true, force: true });
});
beforeEach(async () => {
  resetServerFiles();
  uploads = [];
  const pg = drizzle(new PGlite(), { schema });
  await migrate(pg, { migrationsFolder: "drizzle" });
  db = pg as unknown as Db;
});

describe("EasyCars sync", () => {
  it("imports the feed and copies each in-feed car's photos into storage", async () => {
    const report = await sync();
    expect(report).toMatchObject({ received: 10, upserted: 10, markedSold: 0, invalidRows: 0, imagesUploaded: 4, imagesPending: 0, csvUnchanged: false });

    const golf = await row("13441");
    expect(golf).toMatchObject({ status: "available", make: "Volkswagen", price: 41800, slug: "2023-volkswagen-golf-gti-13441", vin: "TESTVIN0000000004" });
    expect(golf.imageManifest.map((e) => e.index)).toEqual([1, 2, 5]);
    expect(golf.images).toHaveLength(3);
    expect(golf.images[0]).toMatch(/^https:\/\/photos\.test\/vehicles\/13441\/1-[0-9a-f]{8}\.jpg$/);
    expect((golf.source as Record<string, string>).GearType).toBe("Sports Automatic Dual Clutch");
    expect(golf.featureGroups).toHaveLength(3);

    // Photos for a stock number that is not in the feed are ignored.
    expect(uploads.some((key) => key.includes("99999"))).toBe(false);
    // Editorial overrides fill what EasyCars leaves blank; arrival date comes from the car's earliest photo.
    const testarossa = await row("13171");
    expect(testarossa).toMatchObject({ body: "Coupe", transmission: "Manual", odometer: 12800, odometerUnit: "mi", odometerKm: 20600, price: 459000 });
    expect(testarossa.arrivedAt.toISOString().slice(0, 10)).toBe("2025-07-29");
  });

  it("does nothing on a second run when neither the feed nor the photos changed", async () => {
    await sync();
    uploads = [];
    const before = await row("13441");
    const report = await sync();
    expect(report).toMatchObject({ csvUnchanged: true, upserted: 0, markedSold: 0, imagesUploaded: 0, imagesSkipped: 4 });
    expect(uploads).toEqual([]);
    expect((await row("13441")).updatedAt).toEqual(before.updatedAt);
  });

  it("keeps a car's stored photos after they are purged from the server", async () => {
    await sync();
    for (const name of ["13441_1.jpg", "13441_2.jpg", "13441_5.jpg"]) unlinkSync(join(root, "images", name));
    const report = await sync();
    expect(report.imagesUploaded).toBe(0);
    expect((await row("13441")).images).toHaveLength(3);
  });

  it("copies only new and changed photos, and drops ones removed while others remain", async () => {
    await sync();
    uploads = [];
    photo("13441_2.jpg", "golf-rear-retaken", new Date("2026-06-01T00:00:00Z"));
    photo("13441_3.jpg", "golf-side");
    unlinkSync(join(root, "images", "13441_5.jpg"));
    const report = await sync();
    expect(report.imagesUploaded).toBe(2);
    expect(uploads.map((key) => key.split("/")[2].split("-")[0]).sort()).toEqual(["2", "3"]);
    const golf = await row("13441");
    expect(golf.imageManifest.map((e) => e.index)).toEqual([1, 2, 3]);
  });

  it("marks cars missing from a later feed as sold, and brings back one that returns", async () => {
    await sync();
    rewriteCsv((lines) => lines.filter((line) => !line.startsWith("13441,")));
    expect(await sync()).toMatchObject({ received: 9, markedSold: 1 });
    const sold = await row("13441");
    expect(sold.status).toBe("sold");
    expect(sold.soldAt).toBeInstanceOf(Date);
    expect(sold.images).toHaveLength(3); // kept for the sold page

    rewriteCsv((lines) => lines);
    expect(await sync()).toMatchObject({ received: 10, markedSold: 0 });
    expect(await row("13441")).toMatchObject({ status: "available", soldAt: null });
  });

  it("applies price changes but never overwrites the featured flag or the first arrival date", async () => {
    await sync();
    await db.update(vehicles).set({ featured: true }).where(eq(vehicles.id, "13441"));
    const arrived = (await row("13441")).arrivedAt;
    photo("13441_9.jpg", "older-photo", new Date("2024-01-01T00:00:00Z"));
    rewriteCsv((lines) => lines.map((line) => (line.startsWith("13441,") ? line.replace("41800.0000", "39990.0000") : line)));
    await sync();
    expect(await row("13441")).toMatchObject({ price: 39990, featured: true, arrivedAt: arrived });
  });

  it("respects the per-run photo cap and finishes the rest on the next run", async () => {
    const first = await sync({ maxImages: 3 });
    expect(first).toMatchObject({ imagesUploaded: 3, imagesPending: 1 });
    const second = await sync({ maxImages: 3 });
    expect(second).toMatchObject({ csvUnchanged: true, imagesUploaded: 1, imagesPending: 0 });
    expect((await row("13441")).images).toHaveLength(3);
    expect((await row("13171")).images).toHaveLength(1);
  });

  it("writes nothing on a dry run but reports what it would do", async () => {
    const report = await sync({ dryRun: true });
    expect(report).toMatchObject({ dryRun: true, received: 10, upserted: 0, imagesUploaded: 0, imagesPending: 4 });
    expect(report.vehicles).toHaveLength(10);
    expect(uploads).toEqual([]);
    expect(await db.select().from(vehicles)).toEqual([]);
    expect(await db.select().from(syncState)).toEqual([]);
  });
});

describe("EasyCars sync failures leave stock untouched", () => {
  const snapshot = async () => (await db.select({ id: vehicles.id, status: vehicles.status, price: vehicles.price, images: vehicles.images }).from(vehicles)).sort((a, b) => a.id.localeCompare(b.id));

  it("fails cleanly when the server is unreachable", async () => {
    await sync();
    const before = await snapshot();
    await expect(sync({}, PORT + 3000)).rejects.toBeInstanceOf(TransportError);
    expect(await snapshot()).toEqual(before);
  });

  it("never includes the password in an error", async () => {
    const transport = new FtpTransport({ host: "127.0.0.1", port: PORT, user: "mmc", password: "wrong-" + PASSWORD, timeoutMs: 3000 });
    const error = await runEasyCarsSync(db, transport, store, options).catch((e: Error) => e);
    transport.close();
    expect(error).toBeInstanceOf(TransportError);
    expect((error as Error).message).not.toContain(PASSWORD);
  });

  it("refuses an empty or malformed feed", async () => {
    await sync();
    const before = await snapshot();
    rewriteCsv((lines) => [lines[0]]);
    await expect(sync()).rejects.toThrow(/no rows/);
    writeFileSync(join(root, "meridianwholesale.csv"), "this,is,not\r\nthe,right,file\r\n");
    await expect(sync()).rejects.toThrow(/missing expected columns/);
    expect(await snapshot()).toEqual(before);
  });

  it("refuses a feed where too many rows are invalid", async () => {
    await sync();
    const before = await snapshot();
    rewriteCsv((lines) => lines.map((line, i) => (i > 0 && i <= 4 ? line.replace(/^(\d+),/, ",") : line)));
    await expect(sync()).rejects.toThrow(/rows are invalid/);
    expect(await snapshot()).toEqual(before);
  });
});
