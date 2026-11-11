import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { formatOdometer, formatPrice, vehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

export function VehicleCard({ vehicle: v, priority = false }: { vehicle: Vehicle; priority?: boolean }) {
  const title = vehicleTitle(v);
  const detail = [v.variant, v.drive].filter(Boolean).join(" · ");
  const enquire = `mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${title} (stock ${v.stockNumber})`)}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-ink/12 bg-white">
      <Link href={`/cars/${v.slug}`} className="group relative block aspect-16/10 overflow-hidden bg-ink" tabIndex={-1} aria-hidden>
        <Image
          src={v.images[0] ?? "/placeholder-car.svg"}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {v.status === "reserved" && (
          <span className="absolute left-0 top-4 rounded-r-full bg-ink px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper">
            Reserved
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-7 pb-8 pt-9 sm:px-10 sm:pt-11">
        <h3 className="text-[1.75rem] font-bold leading-tight tracking-tight xl:text-[2.1rem]">
          {v.make} <span className="text-ink/50">{v.model}</span>{" "}
          <span className="align-baseline text-base font-semibold tracking-normal text-ink/35">{v.year}</span>
        </h3>
        {detail && <p className="mt-2.5 text-base leading-snug text-ink/75 xl:text-[1.05rem]">{detail}</p>}

        <VehicleSpecs vehicle={v} className="mt-8" />

        {/* mt-auto pins the price row to the bottom so cards in a row line up; pt keeps a gap above the rule. */}
        <div className="mt-auto pt-8">
          <p className="border-t border-ink/15 pt-7 text-2xl font-bold tracking-tight">{formatPrice(v.price)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 text-[0.8rem] font-medium uppercase tracking-[0.16em]">
        <Link
          href={`/cars/${v.slug}`}
          aria-label={`View ${title}`}
          className="flex items-center justify-center gap-4 bg-ink/8 py-6 text-ink transition-colors hover:bg-ink/15"
        >
          View <Arrow />
        </Link>
        <a
          href={enquire}
          aria-label={`Enquire about ${title}`}
          className="flex items-center justify-center gap-4 bg-ink py-6 text-paper transition-colors hover:bg-ink/85"
        >
          Enquire <Arrow />
        </a>
      </div>
    </article>
  );
}

/** Full-width feature shown above the grid: large photo beside the dealer's own write-up. */
export function FeaturedVehicle({ vehicle: v }: { vehicle: Vehicle }) {
  const title = vehicleTitle(v);
  const enquire = `mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${title} (stock ${v.stockNumber})`)}`;
  const odometer = formatOdometer(v);
  // Show the first two paragraphs of the dealer comment; the rest belongs on the car's own page.
  const [lead, ...rest] = v.description.split(/\n\s*\n/).filter(Boolean);

  return (
    // Highlight border: see `feature-frame` in globals.css (graphite edge with a travelling band of yellow light).
    <div className="feature-frame rounded-[1.3rem]">
    <article className="grid overflow-hidden rounded-2xl bg-white text-ink xl:grid-cols-[1.6fr_1fr]">
      <Link href={`/cars/${v.slug}`} className="group relative block aspect-16/10 overflow-hidden xl:aspect-auto xl:min-h-[24rem]" tabIndex={-1} aria-hidden>
        <Image
          src={v.images[0] ?? "/placeholder-car.svg"}
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-col p-8 sm:p-10 xl:p-9">
        <p className="inline-flex items-center gap-2 self-start rounded-full bg-[#fbbc04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
          <svg aria-hidden viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
          </svg>
          Featured
        </p>
        <h2 className="mt-4 font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl xl:text-[2.6rem] 2xl:text-5xl">
          {v.year} {v.make} {v.model}
        </h2>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-ink/55">
          {[odometer, v.transmission, v.body, v.drive].filter(Boolean).join("  ·  ")}
        </p>

        {/* One text style throughout. The second paragraph only shows where there is room without stretching the photo. */}
        <div className="mt-5 space-y-3 leading-relaxed text-ink/75">
          {lead && <p>{lead}</p>}
          {rest[0] && <p className="xl:hidden 2xl:block">{rest[0]}</p>}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-7">
          <p className="text-3xl font-bold tracking-tight">{formatPrice(v.price)}</p>
          <div className="flex gap-3 text-[0.8rem] font-medium uppercase tracking-[0.16em]">
            <Link href={`/cars/${v.slug}`} aria-label={`View ${title}`} className="flex items-center gap-4 rounded-full border border-ink/30 px-6 py-3.5 transition-colors hover:border-ink">
              View <Arrow />
            </Link>
            <a href={enquire} aria-label={`Enquire about ${title}`} className="flex items-center gap-4 rounded-full bg-ink px-6 py-3.5 text-paper transition-colors hover:bg-ink/85">
              Enquire <Arrow />
            </a>
          </div>
        </div>
      </div>
    </article>
    </div>
  );
}

/** The four headline specs with icons, shared by the showroom card and the car's own page. */
export function VehicleSpecs({ vehicle: v, className = "" }: { vehicle: Vehicle; className?: string }) {
  return (
    <dl className={`grid grid-cols-2 gap-x-5 gap-y-6 ${className}`}>
      <Spec label="Kilometres" value={formatOdometer(v)}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12l4-5M5.5 15h13" />
      </Spec>
      <Spec label="Transmission" value={v.transmission}>
        <path d="M6 5v14M12 5v14M18 5v7H6" />
        <circle cx="6" cy="5" r="1.6" />
        <circle cx="12" cy="5" r="1.6" />
        <circle cx="18" cy="5" r="1.6" />
      </Spec>
      <Spec label="Body type" value={v.body}>
        <path d="M3 16.5v-3.2c0-.8.5-1.5 1.3-1.7l2.5-.7 2-2.8c.4-.5 1-.8 1.6-.8h4.3c.6 0 1.2.3 1.6.8l2.2 2.9 1.3.4c.7.2 1.2.9 1.2 1.6v3.5h-1.5M9.5 16.5h5M3 16.5h1.5" />
        <circle cx="7" cy="16.5" r="2" />
        <circle cx="17" cy="16.5" r="2" />
      </Spec>
      <Spec label="Fuel" value={v.fuel}>
        <path d="M5 20V5.5A1.5 1.5 0 016.5 4h6A1.5 1.5 0 0114 5.5V20M4 20h11M7 8h5M14 11h2a1.5 1.5 0 011.5 1.5V16a1.3 1.3 0 002.6 0V9l-2.6-3" />
      </Spec>
    </dl>
  );
}

function Spec({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-7 w-7 shrink-0 text-ink/70" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
      <div className="min-w-0 text-[0.85rem] uppercase leading-snug xl:text-[0.95rem]">
        <dd className="font-bold tracking-wide">{value}</dd>
        <dt className="text-ink/60">{label}</dt>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 28 10" className="h-2.5 w-7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 5h27M22.5 1l4.5 4-4.5 4" />
    </svg>
  );
}

export function VehicleGrid({ vehicles, priorityCount = 0 }: { vehicles: Vehicle[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,26rem),1fr))] gap-6 xl:gap-8">
      {vehicles.map((v, i) => (
        <VehicleCard key={v.id} vehicle={v} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,26rem),1fr))] gap-6 xl:gap-8" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[40rem] animate-pulse rounded-2xl bg-ink/6" />
      ))}
    </div>
  );
}
