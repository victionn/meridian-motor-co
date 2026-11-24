import type { Metadata } from "next";
import { ButtonLink, CertifiedSection, ContactDetails, PageBody, PageHero, PageSection, Photo, Points, TickList } from "@/components/page";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Servicing, service plans and extended warranty",
  description:
    "MeridianMotorCare service plans, extended warranty powered by Integrity Car Care, and log book servicing and repairs at Meridian Garage, Lane Cove West.",
  alternates: { canonical: "/service" },
  openGraph: { images: ["/pages/service.jpg"] },
};

const BASE = [
  "Annual pink slip inspection",
  "Vehicle health check",
  "Synthetic engine oil and filter",
  "Complimentary wash",
  "Tyre inflation check and correction",
  "Diagnostic scan",
  "Service maintenance reset",
];
const PLUS = ["Spark plugs", "Complimentary loan car", "Wiper replacement", "Cabin and air filter", "Brake fluid"];

const PLANS = [
  { name: "3 Years Care Basic", price: 550, items: BASE },
  { name: "3 Years Care Plus", price: 700, items: [...BASE, ...PLUS] },
  { name: "5 Years Care Plus", price: 900, items: [...BASE, ...PLUS, "Fuel filter"] },
];

const WARRANTY = [
  { term: "1 year", from: 1610 },
  { term: "2 years", from: 1870 },
  { term: "3 years", from: 2120 },
];

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

export default function ServicePage() {
  return (
    <>
      <PageHero
        eyebrow="MeridianMotorCare"
        title="The perfect fit for your new vehicle"
        intro="Service plans, extended warranty and expert servicing at Meridian Garage — total peace of mind that every part, tool and hand that touches your car meets the standard you expect."
        image="/pages/service.jpg"
        imageAlt="A silver Porsche 911 Turbo S Cabriolet at sunset with a Meridian number plate"
        imagePosition="70% 60%"
        light={{
          // Measured on the 2400 × 1150 photo: the setting sun, its streak on the road, and the full-width taillight.
          ratio: 2400 / 1150,
          position: [70, 60],
          sun: [26, 29.1],
          glint: { at: [27, 62], size: [7, 16] },
          taillight: { from: [65.6, 51.2], to: [95.8, 49.65], thickness: 0.9 },
        }}
      >
        <ButtonLink href={site.service.bookingUrl} tone="light">Book a service</ButtonLink>
        <ButtonLink href="#service-plans" tone="light" variant="secondary">View service plans</ButtonLink>
      </PageHero>

      <PageBody>
        <PageSection
          first
          id="service-plans"
          title="Service plans"
          intro="No one knows your luxury car better than the technicians at Meridian Garage. Remove the hassle of finding repairers and scheduling services with one of our plans."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <article
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl p-8 sm:p-10 ${i === PLANS.length - 1 ? "bg-midnight text-paper" : "bg-cobalt/6"}`}
              >
                {/* A cobalt-to-tangerine strip along the top of each card. */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-cobalt to-accent" />
                <h3 className={`text-sm font-semibold uppercase tracking-[0.18em] ${i === PLANS.length - 1 ? "text-accent" : "text-cobalt"}`}>{plan.name}</h3>
                <p className="mt-4 font-classic text-6xl leading-none">
                  {money(plan.price)}
                  <span className="ml-2 font-sans text-lg opacity-60">/year</span>
                </p>
                <TickList className="mt-8 [&_li]:text-base" items={plan.items} />
              </article>
            ))}
          </div>
        </PageSection>

        <PageSection
          id="extended-warranty"
          title="Extended warranty"
          intro="Powered by Integrity Car Care: the ultimate protection against unexpected repair costs."
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <TickList items={["Unlimited claims", "Unlimited kilometres", "Parts and labour cover, Australia-wide", "Fully transferable"]} />
            <dl className="divide-y divide-ink/15 border-y border-ink/15">
              {WARRANTY.map((w) => (
                <div key={w.term} className="flex items-baseline justify-between gap-6 py-5">
                  <dt className="text-xl">Essential Warranty, {w.term}</dt>
                  <dd className="text-xl font-semibold text-cobalt">from {money(w.from)}*</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-6 text-sm text-ink/55">*Starting prices. Ask us for the full product disclosure statement.</p>
        </PageSection>

        <PageSection
          id="meridian-garage"
          title="Introducing Meridian Garage"
          intro="Buy your next car from Meridian Motor Co and you receive something priceless: an invitation to Meridian Garage — safety, independence and motoring free of worries, knowing your car's maintenance is in the best hands possible."
        >
          <Points
            columns={4}
            items={[
              { icon: "logbook", title: "Log book service", body: "Serviced to manufacturer requirements, to maintain your factory warranty." },
              { icon: "battery", title: "Electrical diagnostics", body: "The latest equipment pinpoints faults and gets you back on the road quickly." },
              { icon: "cog", title: "Mechanical repairs", body: "Whatever the fault, we get your car back to perfect working order fast." },
              { icon: "snowflake", title: "Air conditioning", body: "We pinpoint and repair air-conditioning leaks accurately." },
              { icon: "brake", title: "Brakes", body: "Pads, discs and sensors for luxury and performance cars." },
              { icon: "gearbox", title: "Transmission", body: "Repairs for every gearbox type: automatic, single clutch or dual clutch." },
              { icon: "tyre", title: "Tyres", body: "Tyre replacement, wheel balancing and alignment while you wait." },
              { icon: "wheel", title: "Wheel refurbishment", body: "Scratched wheels refurbished to their original finish." },
            ]}
          />
          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href={site.service.bookingUrl}>Book an appointment</ButtonLink>
            <ButtonLink href={site.service.website} variant="secondary">Visit Meridian Garage</ButtonLink>
          </div>
        </PageSection>

        <PageSection
          title="Why choose Meridian Garage"
          intro="Service precisely tailored to your requirements, from fast and reliable repairs to complete cost transparency."
        >
          <Points
            columns={4}
            items={[
              { icon: "heart", title: "Passionate technicians", body: "Our technicians are just as passionate about luxury cars as you are." },
              { icon: "garage", title: "State-of-the-art facility", body: "Investment in the latest equipment means we service the latest models." },
              { icon: "clock", title: "Same-day service", body: "Drop your car off before 9am and pick it up fully serviced by 5pm." },
              { icon: "calendar", title: "Since 2011", body: "More than ten years' experience looking after Sydney's luxury cars." },
            ]}
          />
          <div className="mt-16 grid gap-10 md:grid-cols-2">
            <figure>
              <Photo src="/pages/lounge.jpg" alt="The customer lounge at Meridian Garage" />
              <figcaption className="mt-5">
                <span className="block text-2xl font-semibold tracking-tight">Lounge access</span>
                <span className="mt-2 block text-lg leading-relaxed text-ink/70">Relax in our lounge with complimentary refreshments and Wi-Fi.</span>
              </figcaption>
            </figure>
            <figure>
              <Photo src="/pages/drop-and-go.jpg" alt="A hand holding out car keys" />
              <figcaption className="mt-5">
                <span className="block text-2xl font-semibold tracking-tight">Drop and go</span>
                <span className="mt-2 block text-lg leading-relaxed text-ink/70">
                  Leave the keys with us before 9:30am and collect your car any time from 4pm. Can&apos;t be off the road? Add a loan car to your booking.
                </span>
              </figcaption>
            </figure>
          </div>
        </PageSection>

        <PageSection title="Contact Meridian Garage">
          <ContactDetails garage />
        </PageSection>

        <CertifiedSection />
      </PageBody>
    </>
  );
}
