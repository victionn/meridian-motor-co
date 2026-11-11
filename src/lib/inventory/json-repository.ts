import seed from "@/data/vehicles.json";
import { odometerKm } from "../format";
import type { Facet, InventoryQuery, InventoryResult, Vehicle } from "../types";
import { DEFAULT_PAGE_SIZE, type InventoryRepository } from "./repository";

/** In-memory repository backed by src/data/vehicles.json. For local dev and demos. */
export class JsonInventoryRepository implements InventoryRepository {
  private vehicles = (seed as Vehicle[]).filter((v) => v.status !== "sold");

  async search(query: InventoryQuery): Promise<InventoryResult> {
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const q = query.q?.toLowerCase();

    const has = <T,>(wanted: T[] | undefined, value: T | undefined) => !wanted || (value !== undefined && wanted.includes(value));

    // A ticked model narrows only its own make: "Porsche + Ferrari 456" means every Porsche plus the 456.
    const narrowedMakes = new Set(this.vehicles.filter((v) => query.model?.includes(v.model)).map((v) => v.make));
    const modelOk = (v: Vehicle) =>
      !query.model || query.model.includes(v.model) || (query.make !== undefined && !narrowedMakes.has(v.make));

    const filtered = this.vehicles.filter((v) => {
      if (q && !`${v.year} ${v.make} ${v.model} ${v.variant ?? ""}`.toLowerCase().includes(q)) return false;
      if (!has(query.make, v.make) || !modelOk(v)) return false;
      if (!has(query.body, v.body) || !has(query.fuel, v.fuel) || !has(query.transmission, v.transmission)) return false;
      if (!has(query.drive, v.drive) || !has(query.colour, v.colour)) return false;
      if (!has(query.seats, v.seats) || !has(query.doors, v.doors)) return false;
      if (query.minPrice && (v.price ?? 0) < query.minPrice) return false;
      if (query.maxPrice && (v.price ?? Infinity) > query.maxPrice) return false;
      if (query.minYear && v.year < query.minYear) return false;
      if (query.maxYear && v.year > query.maxYear) return false;
      if (query.minKm && toKm(v) < query.minKm) return false;
      if (query.maxKm && toKm(v) > query.maxKm) return false;
      return true;
    });

    const sorted = [...filtered].sort(comparator(query.sort ?? "newest"));
    const page = Math.max(query.page ?? 1, 1);
    const pageCount = Math.max(Math.ceil(sorted.length / pageSize), 1);

    return {
      items: sorted.slice((page - 1) * pageSize, page * pageSize),
      total: sorted.length,
      page,
      pageSize,
      pageCount,
      facets: {
        make: facet(this.vehicles, (v) => v.make),
        model: modelFacet(this.vehicles),
        body: facet(this.vehicles, (v) => v.body),
        fuel: facet(this.vehicles, (v) => v.fuel),
        transmission: facet(this.vehicles, (v) => v.transmission),
        drive: facet(this.vehicles, (v) => v.drive),
        colour: facet(this.vehicles, (v) => v.colour),
        seats: facet(this.vehicles, (v) => v.seats),
        doors: facet(this.vehicles, (v) => v.doors),
      },
    };
  }

  async getBySlug(slug: string) {
    return (seed as Vehicle[]).find((v) => v.slug === slug) ?? null;
  }

  async getFeatured(limit: number) {
    return this.vehicles.filter((v) => v.featured).slice(0, limit);
  }

  async getLatest(limit: number) {
    return [...this.vehicles].sort(comparator("newest")).slice(0, limit);
  }

  async getSimilar(vehicle: Vehicle, limit: number) {
    return this.vehicles
      .filter((v) => v.id !== vehicle.id)
      .map((v) => ({ v, score: (v.make === vehicle.make ? 2 : 0) + (v.body === vehicle.body ? 1 : 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ v }) => v);
  }

  async getAllSlugs() {
    return (seed as Vehicle[]).map((v) => ({ slug: v.slug, updatedAt: v.arrivedAt }));
  }
}

const toKm = odometerKm;

function comparator(sort: NonNullable<InventoryQuery["sort"]>) {
  const price = (v: Vehicle) => v.price ?? Number.MAX_SAFE_INTEGER;
  switch (sort) {
    case "price-asc":
      return (a: Vehicle, b: Vehicle) => price(a) - price(b);
    case "price-desc":
      return (a: Vehicle, b: Vehicle) => (b.price ?? 0) - (a.price ?? 0);
    case "km-asc":
      return (a: Vehicle, b: Vehicle) => toKm(a) - toKm(b);
    case "km-desc":
      return (a: Vehicle, b: Vehicle) => toKm(b) - toKm(a);
    case "year-desc":
      return (a: Vehicle, b: Vehicle) => b.year - a.year;
    default:
      return (a: Vehicle, b: Vehicle) => b.arrivedAt.localeCompare(a.arrivedAt);
  }
}

/** Count vehicles per value, skipping vehicles where the field is blank. */
function facet(list: Vehicle[], pick: (v: Vehicle) => string | number | undefined): Facet[] {
  const counts = new Map<string, number>();
  for (const v of list) {
    const value = pick(v);
    if (value === undefined || value === "") continue;
    counts.set(String(value), (counts.get(String(value)) ?? 0) + 1);
  }
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true }));
}

function modelFacet(list: Vehicle[]) {
  const counts = new Map<string, { make: string; value: string; count: number }>();
  for (const v of list) {
    const key = `${v.make}\u0000${v.model}`;
    const entry = counts.get(key) ?? { make: v.make, value: v.model, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  return [...counts.values()].sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true }));
}
