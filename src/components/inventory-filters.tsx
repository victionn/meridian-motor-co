"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useOptimistic, useState, useTransition } from "react";
import type { Facet, InventoryResult } from "@/lib/types";

const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-AU");

const PRICES = [20000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 300000, 500000];
const YEARS = [1970, 1980, 1990, 2000, 2005, 2010, 2015, 2018, 2020, 2022, 2024];
const KMS = [10000, 20000, 40000, 60000, 80000, 100000, 150000];

/** Every URL param this panel owns; "Clear all" removes exactly these (search text and sort are kept). */
const FILTER_KEYS = ["make", "model", "body", "fuel", "transmission", "drive", "colour", "seats", "doors", "minPrice", "maxPrice", "minYear", "maxYear", "minKm", "maxKm"];

/**
 * Showroom filter panel. The URL is the single source of truth: each change rewrites the search params and the
 * server re-renders the results, so a filtered view can be shared or bookmarked. Updates are applied
 * optimistically so boxes tick instantly.
 */
export function InventoryFilters({ facets }: { facets: InventoryResult["facets"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useOptimistic(urlParams.toString());
  const params = new URLSearchParams(query);

  const commit = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(query);
    mutate(next);
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      setQuery(qs);
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const selected = (key: string) => params.getAll(key);
  const toggle = (key: string, value: string, alsoClear?: (next: URLSearchParams) => void) =>
    commit((next) => {
      const values = next.getAll(key);
      next.delete(key);
      for (const v of values.includes(value) ? values.filter((x) => x !== value) : [...values, value]) next.append(key, v);
      alsoClear?.(next);
    });
  const setOne = (key: string, value: string) => commit((next) => (value ? next.set(key, value) : next.delete(key)));
  const anyActive = FILTER_KEYS.some((key) => params.has(key));

  const checks = (key: string, items: Facet[], label: (value: string) => string = (v) => v) =>
    items.map((f) => (
      <Check key={f.value} checked={selected(key).includes(f.value)} onChange={() => toggle(key, f.value)}>
        {label(f.value)} <span className="text-ink/50">({f.count})</span>
      </Check>
    ));

  const range = (minKey: string, maxKey: string, minLabel: string, maxLabel: string, options: number[], format: (n: number) => string) => (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {([[minKey, minLabel], [maxKey, maxLabel]] as const).map(([key, label]) => (
        <label key={key} className="block text-xs font-medium uppercase tracking-wider text-ink/60">
          {label}
          <select
            value={params.get(key) ?? ""}
            onChange={(e) => setOne(key, e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink/25 bg-white px-2.5 py-2.5 text-sm font-normal normal-case tracking-normal text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Any</option>
            {options.map((n) => (
              <option key={n} value={n}>
                {format(n)}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );

  const makes = selected("make");

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/15 bg-white">
      <div className="flex items-center justify-between px-6 pb-3 pt-6">
        <h2 className="text-2xl font-bold tracking-tight">Filters</h2>
        {anyActive && (
          <button type="button" onClick={() => commit((next) => FILTER_KEYS.forEach((key) => next.delete(key)))} className="text-sm underline underline-offset-4">
            Clear all
          </button>
        )}
      </div>

      <Group title="Make & Model" defaultOpen>
        {facets.make.map((make) => {
          const on = makes.includes(make.value);
          const models = facets.model.filter((m) => m.make === make.value);
          return (
            <div key={make.value}>
              <Check
                checked={on}
                onChange={() =>
                  // Unticking a make also drops any of its models that were ticked.
                  toggle("make", make.value, (next) => {
                    if (!on) return;
                    const keep = next.getAll("model").filter((m) => !models.some((x) => x.value === m));
                    next.delete("model");
                    keep.forEach((m) => next.append("model", m));
                  })
                }
              >
                {make.value} <span className="text-ink/50">({make.count})</span>
              </Check>
              {on && models.length > 1 && <div className="mb-1 ml-[9px] border-l border-ink/15 pl-5">{checks("model", models)}</div>}
            </div>
          );
        })}
      </Group>

      <Group title="Body type" defaultOpen={params.has("body")} hidden={!facets.body.length}>
        {checks("body", facets.body)}
      </Group>
      <Group title="Price" defaultOpen={params.has("minPrice") || params.has("maxPrice")}>
        {range("minPrice", "maxPrice", "Min price", "Max price", PRICES, (n) => money.format(n))}
      </Group>
      <Group title="Year" defaultOpen={params.has("minYear") || params.has("maxYear")}>
        {range("minYear", "maxYear", "From", "To", YEARS, String)}
      </Group>
      <Group title="Kilometres" defaultOpen={params.has("minKm") || params.has("maxKm")}>
        {range("minKm", "maxKm", "From", "To", KMS, (n) => `${num.format(n)} km`)}
      </Group>
      <Group title="Fuel type" defaultOpen={params.has("fuel")} hidden={!facets.fuel.length}>
        {checks("fuel", facets.fuel)}
      </Group>
      <Group title="Transmission" defaultOpen={params.has("transmission")} hidden={!facets.transmission.length}>
        {checks("transmission", facets.transmission)}
      </Group>
      <Group title="Drivetrain" defaultOpen={params.has("drive")} hidden={!facets.drive.length}>
        {checks("drive", facets.drive)}
      </Group>
      <Group title="Seats" defaultOpen={params.has("seats")} hidden={!facets.seats.length}>
        {checks("seats", facets.seats, (v) => `${v} seats`)}
      </Group>
      <Group title="Doors" defaultOpen={params.has("doors")} hidden={!facets.doors.length}>
        {checks("doors", facets.doors, (v) => `${v} doors`)}
      </Group>
      <Group title="Colour" defaultOpen={params.has("colour")} hidden={!facets.colour.length}>
        {checks("colour", facets.colour)}
      </Group>
    </div>
  );
}

/** Collapsible section. Open state is local, so it stays how the visitor left it while results update. */
function Group({ title, defaultOpen = false, hidden = false, children }: { title: string; defaultOpen?: boolean; hidden?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  if (hidden) return null;
  return (
    <section className="border-t border-ink/10">
      <h3>
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold">
          {title}
          <svg aria-hidden viewBox="0 0 16 16" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6l5 5 5-5" />
          </svg>
        </button>
      </h3>
      {open && <div className="px-6 pb-5">{children}</div>}
    </section>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2 text-[0.95rem]">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-[18px] w-[18px] shrink-0 cursor-pointer rounded accent-ink" />
      <span>{children}</span>
    </label>
  );
}
