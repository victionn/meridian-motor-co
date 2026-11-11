import type { InventoryQuery, InventoryResult, Vehicle } from "../types";

/**
 * Storage-agnostic inventory access. Pages only talk to this interface,
 * so the backing store (JSON seed → Postgres → search engine) can change
 * without touching UI code.
 */
export interface InventoryRepository {
  search(query: InventoryQuery): Promise<InventoryResult>;
  getBySlug(slug: string): Promise<Vehicle | null>;
  getFeatured(limit: number): Promise<Vehicle[]>;
  getLatest(limit: number): Promise<Vehicle[]>;
  getSimilar(vehicle: Vehicle, limit: number): Promise<Vehicle[]>;
  getAllSlugs(): Promise<{ slug: string; updatedAt: string }[]>;
}

export const DEFAULT_PAGE_SIZE = 12;
