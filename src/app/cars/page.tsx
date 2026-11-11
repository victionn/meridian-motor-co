import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { InventoryFilters } from "@/components/inventory-filters";
import { SortSelect } from "@/components/sort-select";
import { FeaturedVehicle, VehicleGrid, VehicleGridSkeleton } from "@/components/vehicle-card";
import { site } from "@/content/site";
import { getVehicle, searchInventory } from "@/lib/inventory";
import { parseInventoryQuery, toParamEntries, toSearchString } from "@/lib/inventory/query";
import type { InventoryQuery, SortKey } from "@/lib/types";

export const metadata: Metadata = {
  title: "Showroom",
  description: "Browse prestige, European, performance and classic cars for sale in Sydney.",
  alternates: { canonical: "/cars" },
};

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "km-asc", label: "Kilometres: low to high" },
  { value: "year-desc", label: "Year: newest first" },
];

export default function ShowroomPage({ searchParams }: PageProps<"/cars">) {
  return (
    // Light scheme here so native checkboxes and selects render light (the site default is dark).
    <div className="bg-paper text-ink [color-scheme:light]">
      <div className="mx-auto max-w-[2000px] px-4 py-8 sm:px-6 sm:py-10 xl:px-8">
        <Suspense fallback={<div className="lg:pl-[21.5rem]"><VehicleGridSkeleton /></div>}>
          <Inventory searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Inventory({ searchParams }: Pick<PageProps<"/cars">, "searchParams">) {
  const query = parseInventoryQuery(await searchParams);
  const result = await searchInventory(query);
  const filters = <InventoryFilters facets={result.facets} />;

  // The feature only heads the untouched first page; once someone searches, filters or sorts, results come first.
  const browsing = toParamEntries(query).length === 0;
  const featured = browsing && site.showroomFeature ? await getVehicle(site.showroomFeature) : null;
  const feature = featured && featured.status !== "sold" ? featured : null;
  // Don't repeat the featured car as the first card directly beneath it.
  const items = feature ? result.items.filter((v) => v.id !== feature.id) : result.items;

  return (
    <div className="lg:grid lg:grid-cols-[19.5rem_1fr] lg:items-start lg:gap-8">
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:rounded-2xl">{filters}</aside>

      <div className="min-w-0">
        <form action="/cars" method="get" className="flex items-center gap-2 rounded-2xl border border-ink/15 bg-white p-2">
          <label htmlFor="showroom-q" className="sr-only">Search the showroom</label>
          <input
            id="showroom-q"
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Search makes, models…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base placeholder:text-ink/45 focus:outline-none"
          />
          {/* Carry the current filters and sort through, so a new search keeps them. */}
          {toParamEntries({ ...query, q: undefined, page: undefined }).map(([name, value]) => (
            <input key={`${name}:${value}`} type="hidden" name={name} value={value} />
          ))}
          <button className="rounded-xl bg-ink px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-ink/85">
            Search
          </button>
        </form>

        {/* Phones and tablets: the same filter panel, tucked behind a toggle above the results. */}
        <details className="mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-white lg:hidden">
          <summary className="cursor-pointer px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.14em]">Filters</summary>
          <div className="border-t border-ink/10">{filters}</div>
        </details>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-classic text-4xl tracking-[-0.015em] sm:text-5xl" aria-live="polite">
            Showroom{" "}
            <span className="font-sans text-base tracking-normal text-ink/60">
              ({result.total} {result.total === 1 ? "result" : "results"}
              {query.q ? <> for “{query.q}”</> : null})
            </span>
          </h1>
          <SortSelect value={query.sort ?? "newest"} options={SORTS} />
        </div>

        {feature && (
          <div className="mt-7">
            <FeaturedVehicle vehicle={feature} />
          </div>
        )}

        <div className="mt-7">
          {result.items.length ? (
            <VehicleGrid vehicles={items} priorityCount={feature ? 0 : 2} />
          ) : (
            <div className="rounded-2xl border border-ink/12 p-12 text-center">
              <p className="text-2xl font-bold tracking-tight">No matches right now.</p>
              <p className="mt-2 text-ink/65">Try removing a filter or searching for a different make or model.</p>
              <Link href="/cars" className="mt-6 inline-block text-sm font-medium uppercase tracking-[0.16em] underline underline-offset-4">
                View all cars
              </Link>
            </div>
          )}
        </div>

        <Pagination query={query} page={result.page} pageCount={result.pageCount} />
      </div>
    </div>
  );
}

function Pagination({ query, page, pageCount }: { query: InventoryQuery; page: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1 text-sm">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={`/cars${toSearchString(query, { page: p })}`}
          aria-current={p === page ? "page" : undefined}
          className={`flex h-11 w-11 items-center justify-center rounded-lg font-medium ${p === page ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/10"}`}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
