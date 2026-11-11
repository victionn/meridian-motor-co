import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PopularFeatures } from "@/components/popular-features";
import { ReviewRatings } from "@/components/review-ratings";
import { ShareButton } from "@/components/share-button";
import { VehicleGrid, VehicleGridSkeleton, VehicleSpecs } from "@/components/vehicle-card";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { site } from "@/content/site";
import { formatOdometer, formatPrice, vehicleTitle } from "@/lib/format";
import { getSimilarVehicles, getVehicle, getVehicleSlugs } from "@/lib/inventory";
import { getPopularFeatures } from "@/lib/popular-features";
import type { Vehicle } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await getVehicleSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicle(slug);
  if (!v) return { title: "Car not found" };
  const title = vehicleTitle(v);
  return {
    title: `${title} for sale`,
    description: `${title} · ${formatOdometer(v)} · ${v.transmission} · ${formatPrice(v.price)}. ${v.description.slice(0, 120)}`,
    alternates: { canonical: `/cars/${v.slug}` },
    openGraph: { title, images: v.images.slice(0, 1) },
  };
}

export default function VehiclePage({ params }: PageProps<"/cars/[slug]">) {
  return (
    // Light scheme, matching the showroom (the site default is dark).
    <div className="bg-paper text-ink [color-scheme:light]">
      <div className="mx-auto max-w-[2000px] px-4 pb-20 pt-6 sm:px-6 sm:pt-8 xl:px-8">
        <Suspense fallback={<div className="aspect-3/2 max-w-5xl animate-pulse rounded-2xl bg-ink/6" />}>
          <VehicleDetail params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function VehicleDetail({ params }: Pick<PageProps<"/cars/[slug]">, "params">) {
  const { slug } = await params;
  const v = await getVehicle(slug);
  if (!v) notFound();

  const title = vehicleTitle(v);
  const sold = v.status === "sold";
  const enquire = `mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${title} (stock ${v.stockNumber})`)}`;
  const paragraphs = v.description.split(/\n\s*\n/).filter(Boolean);
  const popular = getPopularFeatures(v);
  const groups = v.featureGroups?.length ? v.featureGroups : v.features.length ? [{ title: "Features", items: v.features }] : [];

  const specs: [string, string | number | undefined][] = [
    ["Kilometres", formatOdometer(v)],
    ["Year", v.year],
    ["Body type", v.body],
    ["Transmission", v.transmission],
    ["Fuel type", v.fuel],
    ["Drivetrain", v.drive],
    ["Engine", v.engine],
    ["Series", v.series],
    ["Exterior colour", v.colour],
    ["Interior", v.interior],
    ["Seats", v.seats],
    ["Doors", v.doors],
    ["Stock number", v.stockNumber],
    ["VIN", v.vin],
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink/55">
        <Link href="/cars" className="transition-colors hover:text-ink">Showroom</Link>
        <span aria-hidden>/</span>
        <Link href={`/cars?make=${encodeURIComponent(v.make)}`} className="transition-colors hover:text-ink">{v.make}</Link>
        <span aria-hidden>/</span>
        <span className="text-ink" aria-current="page">{v.model}</span>
      </nav>

      {/* Photos and write-up run down the left; the summary rides alongside, staying in view until "You might also like". */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_31rem] xl:gap-12 2xl:grid-cols-[minmax(0,1fr)_36rem] 2xl:gap-16">
        <div className="min-w-0">
          <VehicleGallery images={v.images} alt={title} />
        </div>

        <aside className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100svh-7.5rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:pt-2">
          <h1 className="text-[2.2rem] font-bold leading-[1.1] tracking-tight xl:text-5xl 2xl:text-[3.4rem]">
            {v.make} <span className="text-ink/50">{v.model}</span>{" "}
            <span className="text-xl font-semibold tracking-normal text-ink/35 xl:text-2xl">{v.year}</span>
          </h1>
          {(v.variant || v.engine) && <p className="mt-3 text-lg leading-snug text-ink/75 xl:text-xl 2xl:text-[1.4rem]">{[v.variant, v.body, v.engine].filter(Boolean).join(" · ")}</p>}

          <p className="mt-5 border-b border-ink/15 pb-5 text-[2rem] font-bold tracking-tight xl:text-[2.5rem] 2xl:text-5xl">
            {sold ? "Sold" : formatPrice(v.price)}
            {v.status === "reserved" && (
              <span className="ml-3 rounded-full bg-ink px-3 py-1 align-middle text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-paper">Reserved</span>
            )}
          </p>

          <VehicleSpecs vehicle={v} className="mt-6 xl:gap-y-8 xl:[&_svg]:h-9 xl:[&_svg]:w-9 xl:[&>div>div]:text-[1.05rem] 2xl:[&>div>div]:text-[1.15rem]" />

          <div className="mt-7 overflow-hidden rounded-2xl text-[0.85rem] font-medium uppercase tracking-[0.16em] xl:text-base xl:[&_a]:py-5 xl:[&_button]:py-5">
            {sold ? (
              <Link href="/cars" className="flex items-center justify-center bg-ink py-4 text-paper transition-colors hover:bg-ink/85">
                Browse the showroom
              </Link>
            ) : (
              <>
                <a href={site.phone.href} className="flex items-center justify-center gap-3 bg-ink/12 py-4 transition-colors hover:bg-ink/20">
                  Call {site.phone.display}
                </a>
                <div className="mt-px grid grid-cols-2 gap-px">
                  <ShareButton title={title} className="flex items-center justify-center gap-3 bg-ink/8 py-4 uppercase tracking-[0.16em] transition-colors hover:bg-ink/15" />
                  <a href={enquire} className="flex items-center justify-center gap-4 bg-ink py-4 text-paper transition-colors hover:bg-ink/85">
                    Enquire <span aria-hidden>→</span>
                  </a>
                </div>
              </>
            )}
          </div>

          <p className="mt-5 flex justify-between text-sm text-ink/60 xl:text-base">
            <span>Stock no. {v.stockNumber}</span>
            <a href={site.showroom.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ink">
              Get directions
            </a>
          </p>

          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-ink/15 pt-5 text-[0.9rem] font-medium leading-tight xl:text-[1.05rem] 2xl:text-lg">
            {site.assurances.map((a) => (
              <li key={a.id} className="flex items-center gap-2.5">
                <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  {ASSURANCE_ICONS[a.id]}
                </svg>
                {a.label}
              </li>
            ))}
          </ul>

          <ReviewRatings className="mt-5 space-y-3 border-t border-ink/15 pt-5" />
        </aside>

        {/* Open editorial sections straight on the page (no boxes), set large so the copy carries. */}
        <div className="min-w-0 lg:col-start-1">
      {paragraphs.length > 0 && (
        <Section title="About this car">
          <div className="max-w-5xl space-y-6 text-xl leading-[1.6] text-ink sm:text-[1.4rem]">
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>
      )}

      {popular.length > 0 && (
        <Section title="Popular features">
          <PopularFeatures features={popular} />
        </Section>
      )}

      <Section title="Specifications">
        <dl className="grid grid-cols-2 gap-x-10 md:grid-cols-3 2xl:grid-cols-4">
          {specs
            .filter(([, value]) => value !== undefined && value !== "")
            .map(([label, value]) => (
              // Long values (a VIN, a full engine description) take two columns so they are not broken mid-word.
              <div key={label} className={`border-b border-ink/20 py-6 ${String(value).length > 16 ? "col-span-2" : ""}`}>
                <dd className="text-2xl font-semibold tracking-tight break-words sm:text-[1.7rem]">{value}</dd>
                <dt className="mt-1.5 text-sm uppercase tracking-[0.14em] text-ink/60">{label}</dt>
              </div>
            ))}
        </dl>
      </Section>

      {groups.length > 0 && (
        <Section title="Features">
          <div className="space-y-14">
            {groups.map((g) => (
              <FeatureGroup key={g.title} title={g.title} items={g.items} solo={groups.length === 1} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Visit the showroom">
        <div className="grid gap-10 text-xl sm:grid-cols-2 sm:text-[1.4rem]">
          <div>
            <p className="font-semibold">{site.name}</p>
            <p className="mt-1">
              {site.showroom.street}, {site.showroom.suburb} {site.showroom.state} {site.showroom.postcode}
            </p>
            <a href={site.showroom.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-base font-medium underline underline-offset-4">
              Get directions
            </a>
          </div>
          <dl className="space-y-2">
            {site.showroom.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-6 border-b border-ink/20 pb-4">
                <dt>{h.days}</dt>
                <dd className="font-semibold">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
        </div>
      </div>

      <section className="mt-20 border-t border-ink/20 pt-14 sm:mt-24">
        <h2 className="font-classic text-4xl tracking-[-0.015em] sm:text-5xl">You might also like</h2>
        <div className="mt-10">
          <Suspense fallback={<VehicleGridSkeleton count={3} />}>
            <Similar vehicle={v} />
          </Suspense>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Car",
            name: title,
            brand: { "@type": "Brand", name: v.make },
            model: v.model,
            vehicleModelDate: String(v.year),
            bodyType: v.body,
            vehicleTransmission: v.transmission,
            fuelType: v.fuel,
            color: v.colour,
            mileageFromOdometer: { "@type": "QuantitativeValue", value: Number(formatOdometer(v).replace(/\D/g, "")), unitCode: "KMT" },
            image: v.images.map((src) => new URL(src, site.url).toString()),
            url: `${site.url}/cars/${v.slug}`,
            ...(v.price && !sold
              ? { offers: { "@type": "Offer", price: v.price, priceCurrency: "AUD", availability: "https://schema.org/InStock", seller: { "@type": "AutoDealer", name: site.name } } }
              : {}),
          }),
        }}
      />
    </>
  );
}

/** Line icons for the buyer assurances, in the same hand as the spec icons. */
const ASSURANCE_ICONS: Record<(typeof site.assurances)[number]["id"], React.ReactNode> = {
  inspected: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21M7.8 10.7l1.9 1.9 3.6-4" />
    </>
  ),
  detailed: <path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6zM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z" />,
  warranty: (
    <>
      <path d="M12 3l7.5 2.8v5.4c0 4.6-3 8-7.5 9.8-4.5-1.8-7.5-5.2-7.5-9.8V5.8z" />
      <path d="M8.7 12.2l2.3 2.3 4.3-4.8" />
    </>
  ),
  delivery: (
    <>
      <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.5v3h-7" />
      <circle cx="7" cy="17.5" r="1.9" />
      <circle cx="17" cy="17.5" r="1.9" />
    </>
  ),
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 border-t border-ink/20 pt-12 sm:mt-20">
      <h2 className="font-classic text-4xl tracking-[-0.015em] sm:text-5xl">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

/** One feature group: a grid of ruled items, the first rows shown and the rest behind "Show more" (no JavaScript needed). */
function FeatureGroup({ title, items, solo }: { title: string; items: string[]; solo: boolean }) {
  const SHOWN = 12;
  const grid = "grid gap-x-10 sm:grid-cols-2 2xl:grid-cols-3";
  const item = (text: string) => (
    <li key={text} className="flex items-baseline gap-3.5 border-b border-ink/20 py-4 text-lg">
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 -translate-y-1 bg-ink" />
      {text}
    </li>
  );
  return (
    <div>
      {/* A lone group called "Features" would only repeat the section heading. */}
      {!(solo && title === "Features") && (
        <h3 className="mb-3 text-2xl font-semibold tracking-tight">
          {title} <span className="text-base font-normal text-ink/50">({items.length})</span>
        </h3>
      )}
      <ul className={grid}>{items.slice(0, SHOWN).map(item)}</ul>
      {items.length > SHOWN && (
        <details className="group">
          <summary className="mt-6 cursor-pointer list-none text-base font-semibold underline underline-offset-4 group-open:hidden [&::-webkit-details-marker]:hidden">
            Show all {items.length}
          </summary>
          <ul className={grid}>{items.slice(SHOWN).map(item)}</ul>
        </details>
      )}
    </div>
  );
}

async function Similar({ vehicle }: { vehicle: Vehicle }) {
  const vehicles = await getSimilarVehicles(vehicle, 3);
  return <VehicleGrid vehicles={vehicles} />;
}
