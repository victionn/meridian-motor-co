import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { InventoryQuery, Vehicle } from "../types";
import { JsonInventoryRepository } from "./json-repository";
import { PostgresInventoryRepository } from "./postgres-repository";
import type { InventoryRepository } from "./repository";

/** Cache tag invalidated by the DMS sync job (see app/api/cron/sync-inventory). */
export const INVENTORY_TAG = "inventory";

let repo: InventoryRepository | undefined;
function repository(): InventoryRepository {
  repo ??=
    process.env.INVENTORY_SOURCE === "postgres"
      ? new PostgresInventoryRepository()
      : new JsonInventoryRepository();
  return repo;
}

// All reads are cached and tagged; a sync calls revalidateTag(INVENTORY_TAG).

export async function searchInventory(query: InventoryQuery) {
  "use cache";
  cacheLife("hours");
  cacheTag(INVENTORY_TAG);
  return repository().search(query);
}

export async function getVehicle(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(INVENTORY_TAG, `vehicle:${slug}`);
  return repository().getBySlug(slug);
}

export async function getFeaturedVehicles(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag(INVENTORY_TAG);
  return repository().getFeatured(limit);
}

export async function getLatestVehicles(limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag(INVENTORY_TAG);
  return repository().getLatest(limit);
}

export async function getSimilarVehicles(vehicle: Vehicle, limit = 4) {
  "use cache";
  cacheLife("hours");
  cacheTag(INVENTORY_TAG);
  return repository().getSimilar(vehicle, limit);
}

export async function getVehicleSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(INVENTORY_TAG);
  return repository().getAllSlugs();
}
