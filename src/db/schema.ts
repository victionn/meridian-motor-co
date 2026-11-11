import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const vehicleStatus = pgEnum("vehicle_status", ["available", "reserved", "sold"]);
export const odometerUnit = pgEnum("odometer_unit", ["km", "mi"]);

export const vehicles = pgTable(
  "vehicles",
  {
    id: text("id").primaryKey(), // DMS stock id
    stockNumber: text("stock_number").notNull(),
    slug: text("slug").notNull().unique(),
    status: vehicleStatus("status").notNull().default("available"),
    featured: boolean("featured").notNull().default(false),
    arrivedAt: timestamp("arrived_at", { withTimezone: true }).notNull().defaultNow(),
    soldAt: timestamp("sold_at", { withTimezone: true }),

    year: integer("year").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    variant: text("variant"),
    series: text("series"),

    price: integer("price"), // whole dollars; null = POA
    odometer: integer("odometer").notNull(),
    odometerUnit: odometerUnit("odometer_unit").notNull().default("km"),
    odometerKm: integer("odometer_km").notNull(), // normalised for filtering/sorting

    body: text("body").notNull(),
    transmission: text("transmission").notNull(),
    fuel: text("fuel").notNull(),
    drive: text("drive"),
    engine: text("engine"),
    doors: integer("doors"),
    seats: integer("seats"),
    colour: text("colour"),
    interior: text("interior"),
    vin: text("vin"),

    description: text("description").notNull().default(""),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    // Features as the dealer grouped them ("Factory Options", …); `features` is the same list flattened.
    featureGroups: jsonb("feature_groups").$type<{ title: string; items: string[] }[]>().notNull().default([]),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    // For photos copied from the stock server: what each stored photo was on the server (size, date) and its
    // permanent URL, so a sync can tell new/changed photos from ones it already holds. `images` is derived from it.
    imageManifest: jsonb("image_manifest").$type<{ index: number; ftpSize: number; ftpModified: string; url: string }[]>().notNull().default([]),
    spin360Url: text("spin360_url"),

    // Raw DMS payload for debugging mapping issues.
    source: jsonb("source"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("vehicles_status_idx").on(t.status),
    index("vehicles_make_idx").on(t.make),
    index("vehicles_price_idx").on(t.price),
  ],
);

/** Small key/value store for sync bookkeeping (e.g. which feed file was last processed). */
export const syncState = pgTable("sync_state", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type VehicleRow = typeof vehicles.$inferSelect;
export type NewVehicleRow = typeof vehicles.$inferInsert;
