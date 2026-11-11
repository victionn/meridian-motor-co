import { z } from "zod";
import type { DmsAdapter } from "./adapter";

/**
 * Example adapter for a JSON stock feed at DMS_FEED_URL.
 * The field names below are placeholders — map them to the real provider's
 * payload once confirmed. Validation rejects bad rows instead of publishing them
 * (e.g. a $0 price becomes "Price on application").
 */
const FeedItem = z.object({
  stockId: z.coerce.string(),
  status: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(2100),
  make: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  price: z.coerce.number().optional().nullable(),
  odometer: z.coerce.number().int().nonnegative(),
  odometerUnit: z.enum(["km", "mi"]).default("km"),
  body: z.string().default("Other"),
  transmission: z.string().default("Unknown"),
  fuel: z.string().default("Unknown"),
  drive: z.string().optional().nullable(),
  engine: z.string().optional().nullable(),
  doors: z.coerce.number().int().optional().nullable(),
  seats: z.coerce.number().int().optional().nullable(),
  colour: z.string().optional().nullable(),
  interior: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  photos: z.array(z.string().url()).optional().nullable(),
  spin360Url: z.string().url().optional().nullable(),
  dateInStock: z.string().optional().nullable(),
});

const opt = <T>(v: T | null | undefined) => v ?? undefined;

export class GenericJsonFeedAdapter implements DmsAdapter {
  readonly name = "generic-json-feed";

  constructor(
    private url = process.env.DMS_FEED_URL,
    private apiKey = process.env.DMS_API_KEY,
  ) {}

  async fetchStock() {
    if (!this.url) throw new Error("DMS_FEED_URL is not set");
    const res = await fetch(this.url, {
      headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`DMS feed responded ${res.status}`);

    const raw: unknown = await res.json();
    const list = Array.isArray(raw) ? raw : [];
    const out = [];
    for (const item of list) {
      const parsed = FeedItem.safeParse(item);
      if (!parsed.success) {
        console.warn("[dms] skipped invalid row", parsed.error.issues[0]);
        continue;
      }
      const d = parsed.data;
      out.push({
        id: d.stockId,
        stockNumber: d.stockId,
        status: d.status?.toLowerCase() === "sold" ? ("sold" as const) : ("available" as const),
        arrivedAt: d.dateInStock ? new Date(d.dateInStock).toISOString() : new Date().toISOString(),
        year: d.year,
        make: d.make,
        model: d.model,
        variant: opt(d.variant),
        series: opt(d.series),
        price: d.price && d.price > 0 ? Math.round(d.price) : null,
        odometer: d.odometer,
        odometerUnit: d.odometerUnit,
        body: d.body,
        transmission: d.transmission,
        fuel: d.fuel,
        drive: opt(d.drive),
        engine: opt(d.engine),
        doors: opt(d.doors),
        seats: opt(d.seats),
        colour: opt(d.colour),
        interior: opt(d.interior),
        vin: opt(d.vin),
        description: d.comments ?? "",
        features: d.features ?? [],
        images: d.photos ?? [],
        spin360Url: opt(d.spin360Url),
      });
    }
    return out;
  }
}
