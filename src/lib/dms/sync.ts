import "server-only";
import { and, ne, notInArray, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { buildVehicleSlug, odometerKm } from "../format";
import type { Vehicle } from "../types";
import type { DmsAdapter } from "./adapter";

/** Any Drizzle Postgres database over our schema (postgres-js in production, PGlite in tests). */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
export type StockItem = Omit<Vehicle, "slug" | "featured">;
export type SyncReport = { adapter: string; received: number; upserted: number; markedSold: number };

const { vehicles } = schema;

/**
 * Write a full stock snapshot: upsert every car in it, then mark anything no longer listed as sold (kept for SEO /
 * "recently sold" rather than deleted). Never overwritten by a feed:
 * - `featured` (editorial);
 * - `arrivedAt` (first sighting wins, so "newest arrivals" doesn't reshuffle);
 * - stored photos, when `keepImages` is set (photos are then managed by the image step).
 */
export async function upsertStock(db: Db, stock: StockItem[], options: { keepImages?: boolean; raw?: Record<string, unknown> } = {}) {
  if (stock.length === 0) throw new Error("Feed returned 0 vehicles — refusing to mark all stock sold");
  const now = new Date();

  for (const v of stock) {
    const row = {
      ...v,
      slug: buildVehicleSlug(v),
      arrivedAt: new Date(v.arrivedAt),
      odometerKm: odometerKm(v),
      featureGroups: v.featureGroups ?? [],
      // A car that comes back into the feed (sale fell through) is live again.
      soldAt: v.status === "sold" ? now : null,
      source: options.raw?.[v.id] ?? v,
      updatedAt: now,
    };
    const { images, arrivedAt, ...updatable } = row;
    await db
      .insert(vehicles)
      .values({ ...row, images: options.keepImages ? [] : images })
      .onConflictDoUpdate({
        target: vehicles.id,
        set: { ...updatable, ...(options.keepImages ? {} : { images }), featured: sql`${vehicles.featured}` },
      });
    void arrivedAt;
  }

  const sold = await db
    .update(vehicles)
    .set({ status: "sold", soldAt: now, updatedAt: now })
    .where(and(ne(vehicles.status, "sold"), notInArray(vehicles.id, stock.map((v) => v.id))))
    .returning({ id: vehicles.id });

  return { upserted: stock.length, markedSold: sold.length };
}

/** Pull a feed through its adapter and write it. (EasyCars uses its own runner, easycars-sync.ts, for the photo step.) */
export async function syncInventory(adapter: DmsAdapter, db: Db = getDb()): Promise<SyncReport> {
  const stock = await adapter.fetchStock();
  const result = await upsertStock(db, stock, { keepImages: adapter.keepsStoredImages });
  return { adapter: adapter.name, received: stock.length, ...result };
}
