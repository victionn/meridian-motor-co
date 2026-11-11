import type { InventoryQuery, SortKey } from "../types";

const SORTS: SortKey[] = ["newest", "price-asc", "price-desc", "km-asc", "km-desc", "year-desc"];

type RawParams = Record<string, string | string[] | undefined>;

const str = (v: RawParams[string]) => {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
};
const int = (v: RawParams[string]) => {
  const n = Number.parseInt(str(v) ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
/** Repeated params (?make=BMW&make=Porsche) become a de-duplicated, bounded list. */
const list = (v: RawParams[string]) => {
  const items = [...new Set((Array.isArray(v) ? v : v ? [v] : []).map((s) => s.trim().slice(0, 60)).filter(Boolean))].slice(0, 30);
  return items.length ? items : undefined;
};
const intList = (v: RawParams[string]) => {
  const items = list(v)?.map((s) => Number.parseInt(s, 10)).filter((n) => Number.isFinite(n) && n >= 0);
  return items?.length ? items : undefined;
};

/** Parse untrusted URL search params into a typed, bounded query. */
export function parseInventoryQuery(params: RawParams): InventoryQuery {
  const sort = str(params.sort) as SortKey | undefined;
  return {
    q: str(params.q)?.slice(0, 80),
    make: list(params.make),
    model: list(params.model),
    body: list(params.body),
    fuel: list(params.fuel),
    transmission: list(params.transmission),
    drive: list(params.drive),
    colour: list(params.colour),
    seats: intList(params.seats),
    doors: intList(params.doors),
    minPrice: int(params.minPrice),
    maxPrice: int(params.maxPrice),
    minYear: int(params.minYear),
    maxYear: int(params.maxYear),
    minKm: int(params.minKm),
    maxKm: int(params.maxKm),
    sort: sort && SORTS.includes(sort) ? sort : "newest",
    page: Math.max(int(params.page) ?? 1, 1),
  };
}

/** The query as [name, value] URL pairs (list fields repeat the name), skipping defaults. */
export function toParamEntries(query: InventoryQuery): [string, string][] {
  const out: [string, string][] = [];
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === "" || k === "pageSize") continue;
    if (k === "page" && v === 1) continue;
    if (k === "sort" && v === "newest") continue;
    if (Array.isArray(v)) for (const item of v) out.push([k, String(item)]);
    else out.push([k, String(v)]);
  }
  return out;
}

/** Serialise a query back to a URL (used for pagination / sort links). */
export function toSearchString(query: InventoryQuery, overrides: Partial<InventoryQuery> = {}) {
  const s = new URLSearchParams(toParamEntries({ ...query, ...overrides })).toString();
  return s ? `?${s}` : "";
}
