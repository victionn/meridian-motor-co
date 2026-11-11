import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db/client";
import { vehicles, type VehicleRow } from "@/db/schema";
import type { Facet, InventoryQuery, InventoryResult, Vehicle } from "../types";
import { DEFAULT_PAGE_SIZE, type InventoryRepository } from "./repository";

export class PostgresInventoryRepository implements InventoryRepository {
  async search(query: InventoryQuery): Promise<InventoryResult> {
    const db = getDb();
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = Math.max(query.page ?? 1, 1);
    const where = buildWhere(query);

    const [rows, [{ total }], facets] = await Promise.all([
      db
        .select()
        .from(vehicles)
        .where(where)
        .orderBy(...orderBy(query.sort))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ total: count() }).from(vehicles).where(where),
      this.facets(),
    ]);

    return {
      items: rows.map(toVehicle),
      total,
      page,
      pageSize,
      pageCount: Math.max(Math.ceil(total / pageSize), 1),
      facets,
    };
  }

  async getBySlug(slug: string) {
    const [row] = await getDb().select().from(vehicles).where(eq(vehicles.slug, slug)).limit(1);
    return row ? toVehicle(row) : null;
  }

  async getFeatured(limit: number) {
    const rows = await getDb()
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.status, "available"), eq(vehicles.featured, true)))
      .orderBy(desc(vehicles.arrivedAt))
      .limit(limit);
    return rows.map(toVehicle);
  }

  async getLatest(limit: number) {
    const rows = await getDb()
      .select()
      .from(vehicles)
      .where(eq(vehicles.status, "available"))
      .orderBy(desc(vehicles.arrivedAt))
      .limit(limit);
    return rows.map(toVehicle);
  }

  async getSimilar(vehicle: Vehicle, limit: number) {
    const rows = await getDb()
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.status, "available"),
          ne(vehicles.id, vehicle.id),
          or(eq(vehicles.make, vehicle.make), eq(vehicles.body, vehicle.body)),
        ),
      )
      .orderBy(sql`(${vehicles.make} = ${vehicle.make}) desc`, desc(vehicles.arrivedAt))
      .limit(limit);
    return rows.map(toVehicle);
  }

  async getAllSlugs() {
    const rows = await getDb()
      .select({ slug: vehicles.slug, updatedAt: vehicles.updatedAt })
      .from(vehicles)
      .where(eq(vehicles.status, "available"));
    return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt.toISOString() }));
  }

  private async facets(): Promise<InventoryResult["facets"]> {
    const db = getDb();
    const available = eq(vehicles.status, "available");
    type Col = (typeof vehicles)["make" | "body" | "fuel" | "transmission" | "drive" | "colour" | "seats" | "doors"];
    const group = async (col: Col): Promise<Facet[]> => {
      const rows = await db
        .select({ value: col, count: count() })
        .from(vehicles)
        .where(and(available, isNotNull(col)))
        .groupBy(col)
        .orderBy(asc(col));
      return rows.map((r) => ({ value: String(r.value), count: r.count }));
    };
    const [make, model, body, fuel, transmission, drive, colour, seats, doors] = await Promise.all([
      group(vehicles.make),
      db
        .select({ make: vehicles.make, value: vehicles.model, count: count() })
        .from(vehicles)
        .where(available)
        .groupBy(vehicles.make, vehicles.model)
        .orderBy(asc(vehicles.model)),
      group(vehicles.body),
      group(vehicles.fuel),
      group(vehicles.transmission),
      group(vehicles.drive),
      group(vehicles.colour),
      group(vehicles.seats),
      group(vehicles.doors),
    ]);
    return { make, model, body, fuel, transmission, drive, colour, seats, doors };
  }
}

function buildWhere(q: InventoryQuery): SQL | undefined {
  const clauses: (SQL | undefined)[] = [eq(vehicles.status, "available")];
  if (q.q) {
    const term = `%${q.q.replace(/[%_]/g, "")}%`;
    clauses.push(
      or(
        ilike(vehicles.make, term),
        ilike(vehicles.model, term),
        ilike(vehicles.variant, term),
        sql`${vehicles.year}::text = ${q.q}`,
      ),
    );
  }
  if (q.make) clauses.push(inArray(vehicles.make, q.make));
  if (q.model) {
    // A ticked model narrows only its own make: "Porsche + Ferrari 456" means every Porsche plus the 456.
    const picked = inArray(vehicles.model, q.model);
    clauses.push(
      q.make
        ? or(picked, sql`${vehicles.make} not in (select v2.make from ${vehicles} v2 where v2.model in ${q.model} and v2.status = 'available')`)
        : picked,
    );
  }
  if (q.body) clauses.push(inArray(vehicles.body, q.body));
  if (q.fuel) clauses.push(inArray(vehicles.fuel, q.fuel));
  if (q.transmission) clauses.push(inArray(vehicles.transmission, q.transmission));
  if (q.drive) clauses.push(inArray(vehicles.drive, q.drive));
  if (q.colour) clauses.push(inArray(vehicles.colour, q.colour));
  if (q.seats) clauses.push(inArray(vehicles.seats, q.seats));
  if (q.doors) clauses.push(inArray(vehicles.doors, q.doors));
  if (q.minPrice) clauses.push(gte(vehicles.price, q.minPrice));
  if (q.maxPrice) clauses.push(lte(vehicles.price, q.maxPrice));
  if (q.minYear) clauses.push(gte(vehicles.year, q.minYear));
  if (q.maxYear) clauses.push(lte(vehicles.year, q.maxYear));
  if (q.minKm) clauses.push(gte(vehicles.odometerKm, q.minKm));
  if (q.maxKm) clauses.push(lte(vehicles.odometerKm, q.maxKm));
  return and(...clauses);
}

function orderBy(sort: InventoryQuery["sort"]) {
  switch (sort) {
    case "price-asc":
      return [sql`${vehicles.price} asc nulls last`];
    case "price-desc":
      return [sql`${vehicles.price} desc nulls last`];
    case "km-asc":
      return [asc(vehicles.odometerKm)];
    case "km-desc":
      return [desc(vehicles.odometerKm)];
    case "year-desc":
      return [desc(vehicles.year)];
    default:
      return [desc(vehicles.arrivedAt)];
  }
}

function toVehicle(r: VehicleRow): Vehicle {
  return {
    id: r.id,
    stockNumber: r.stockNumber,
    slug: r.slug,
    status: r.status,
    featured: r.featured,
    arrivedAt: r.arrivedAt.toISOString(),
    year: r.year,
    make: r.make,
    model: r.model,
    variant: r.variant ?? undefined,
    series: r.series ?? undefined,
    price: r.price,
    odometer: r.odometer,
    odometerUnit: r.odometerUnit,
    body: r.body,
    transmission: r.transmission,
    fuel: r.fuel,
    drive: r.drive ?? undefined,
    engine: r.engine ?? undefined,
    doors: r.doors ?? undefined,
    seats: r.seats ?? undefined,
    colour: r.colour ?? undefined,
    interior: r.interior ?? undefined,
    vin: r.vin ?? undefined,
    description: r.description,
    features: r.features,
    featureGroups: r.featureGroups.length ? r.featureGroups : undefined,
    images: r.images,
    spin360Url: r.spin360Url ?? undefined,
  };
}
