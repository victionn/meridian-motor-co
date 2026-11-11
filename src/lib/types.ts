export type VehicleStatus = "available" | "reserved" | "sold";
export type OdometerUnit = "km" | "mi";

export type Vehicle = {
  id: string;
  stockNumber: string;
  slug: string;
  status: VehicleStatus;
  featured: boolean;
  arrivedAt: string; // ISO date

  year: number;
  make: string;
  model: string;
  variant?: string;
  series?: string;

  price: number | null; // null = "Price on application"
  odometer: number;
  odometerUnit: OdometerUnit;

  body: string;
  transmission: string;
  fuel: string;
  drive?: string;
  engine?: string;
  doors?: number;
  seats?: number;
  colour?: string;
  interior?: string;
  vin?: string;

  description: string;
  features: string[];
  /** Features as the dealer grouped them in the listing (e.g. "Factory Options"); `features` is the flat list. */
  featureGroups?: { title: string; items: string[] }[];
  images: string[]; // absolute URLs or /public paths
  spin360Url?: string; // embeddable 360 viewer URL (provider-agnostic)
};

export type SortKey = "newest" | "price-asc" | "price-desc" | "km-asc" | "km-desc" | "year-desc";

/** Showroom search. List fields match any of the given values (OR within a field, AND across fields). */
export type InventoryQuery = {
  q?: string;
  make?: string[];
  model?: string[];
  body?: string[];
  fuel?: string[];
  transmission?: string[];
  drive?: string[];
  colour?: string[];
  seats?: number[];
  doors?: number[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minKm?: number;
  maxKm?: number;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
};

export type Facet = { value: string; count: number };

export type InventoryResult = {
  items: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: {
    make: Facet[];
    /** Models, each tagged with its make so the UI can nest them. */
    model: (Facet & { make: string })[];
    body: Facet[];
    fuel: Facet[];
    transmission: Facet[];
    drive: Facet[];
    colour: Facet[];
    seats: Facet[];
    doors: Facet[];
  };
};
