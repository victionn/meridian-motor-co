import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { ButtonLink, CertifiedSection, PageBody, PageHero, PageSection, Points, TickList } from "@/components/page";
import { TextReveal } from "@/components/text-reveal";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Sell your car",
  description: "Sell your luxury car to Meridian Motor Co: a digital inspection, a market-rate valuation and same-day payment, or trade in on your next car.",
  alternates: { canonical: "/sell" },
  openGraph: { images: ["/pages/sell.jpg"] },
};

export default function SellPage() {
  return (
    // Text loads in as you scroll.
    <TextReveal>
      <PageHero
        eyebrow="Sell or trade in"
        title="We pay more for luxury cars"
        intro="A digital inspection from your phone, a market-rate valuation and same-day payment — or put it towards your next car."
        // The still is the clip's first frame, so the hand-over from photo to motion is invisible.
        image="/pages/sell-hero-poster.jpg"
        imageAlt="A black Mercedes-AMG GT on a racetrack with a Meridian number plate"
        imagePosition="65% 75%"
        video={[
          { src: "/pages/sell-hero-mobile.mp4", type: "video/mp4", media: "(max-width: 767px)" },
          { src: "/pages/sell-hero-desktop.webm", type: "video/webm" },
          { src: "/pages/sell-hero-desktop.mp4", type: "video/mp4" },
        ]}
      >
        <ButtonLink href="#valuation" tone="light">Get a valuation</ButtonLink>
        <ButtonLink href={site.phone.href} tone="light" variant="secondary">Call {site.phone.display}</ButtonLink>
      </PageHero>

      <PageBody>
        <section id="valuation" className="grid scroll-mt-28 gap-12 pt-14 sm:pt-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">Get a valuation</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
              Leave your details and we&apos;ll text you a link to our digital inspection. It takes under five minutes, and keeps the process simple and straightforward.
            </p>
            <TickList className="mt-8" items={["Same-day payment", "Market-rate valuation", "Digital appraisal and immediate settlement"]} />
          </div>
          <LeadForm
            type="valuation"
            fields={["tradeIn", "message"]}
            tradeInLabel="Your car (year, make, model, kilometres)"
            messagePlaceholder="Anything we should know — service history, modifications, finance owing…"
            submitLabel="Get a valuation"
            successTitle="We'll be in touch"
            successMessage="We'll text an inspection link to the mobile number you gave us. Complete it in under five minutes and we'll come back with our offer."
          />
        </section>

        <PageSection title="Sell your car in three steps">
          <Points
            numbered
            items={[
              { title: "Quick inspection", body: "Receive a link to our digital inspection and complete it in under five minutes." },
              { title: "Receive a valuation", body: "Get our competitive offer, then decide on a straight sale or a trade-in on one of our cars." },
              { title: "Payment and handover", body: "Bring the car in for a final check and receive immediate payment through Osko — or trade in and drive away in your next car." },
            ]}
          />
        </PageSection>

        <PageSection
          title="Valuations from the precision experts"
          intro="Our three-stage process delivers an industry-leading valuation of your vehicle."
        >
          <Points
            items={[
              { title: "Driven by precision", body: "Our team of valuation experts considers every detail of your vehicle." },
              { title: "Driven by data", body: "Our proprietary data pinpoints highly accurate values." },
              { title: "Driven by performance", body: "Our market expertise means we can sell your car faster." },
            ]}
          />
        </PageSection>

        <PageSection title="Why sell to us">
          <Points
            columns={2}
            items={[
              { title: "Immediate payment", body: "Receive payment in under a minute, 24/7 — even on weekends, if your bank participates in Osko." },
              { title: "Accurate valuation", body: "Driven by the details and driven to give the most accurate valuation for your luxury car." },
              { title: "Finance payout", body: "We can settle any finance owing. Simply provide your current payout letter." },
              { title: "Guaranteed purchase price", body: "We can give you a guaranteed purchase agreement while you wait for a brand-new car to arrive." },
            ]}
          />
        </PageSection>

        <CertifiedSection />
      </PageBody>
    </TextReveal>
  );
}
