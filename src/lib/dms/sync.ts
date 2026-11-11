import "server-only";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { vehicles } from "@/db/schema";
import { buildVehicleSlug } from "../format";
import type { DmsAdapter } from "./adapter";

export type SyncReport = { adapter: string; received: number; upserted: number; markedSold: number };

/**
 * Upsert the DMS feed into Postgres. Anything no longer in the feed is
 * marked sold (kept for SEO / "recently sold" rather than deleted).
 */
export async function syncInventory(adapter: DmsAdapter): Promise<SyncReport> {
  const db = getDb();
  const stock = await adapter.fetchStock();
  if (stock.length === 0) throw new Error("Feed returned 0 vehicles — refusing to mark all stock sold");

  const now = new Date();
  let upserted = 0;

  for (const v of stock) {
    const row = {
      ...v,
      slug: buildVehicleSlug(v),
      arrivedAt: new Date(v.arrivedAt),
      odometerKm: v.odometerUnit === "mi" ? Math.round(v.odometer * 1.609) : v.odometer,
      soldAt: v.status === "sold" ? now : null,
      source: v,
      updatedAt: now,
    };
    await db
      .insert(vehicles)
      .values(row)
      .onConflictDoUpdate({
        target: vehicles.id,
        // `featured` is editorial — never overwritten by the feed.
        set: { ...row, featured: sql`${vehicles.featured}` },
      });
    upserted++;
  }

  const ids = stock.map((v) => v.id);
  const sold = await db
    .update(vehicles)
    .set({ status: "sold", soldAt: now, updatedAt: now })
    .where(and(eq(vehicles.status, "available"), notInArray(vehicles.id, ids)))
    .returning({ id: vehicles.id });

  return { adapter: adapter.name, received: stock.length, upserted, markedSold: sold.length };
}
