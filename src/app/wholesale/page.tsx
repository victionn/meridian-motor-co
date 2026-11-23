import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { ButtonLink, PageBody, PageHero, PageSection, Points } from "@/components/page";

export const metadata: Metadata = {
  title: "Wholesale partners",
  description: "Become a Meridian Motor Co wholesale partner: expert vehicle valuation, acquisition and supply for dealers, backed by more than 15 years of experience.",
  alternates: { canonical: "/wholesale" },
  openGraph: { images: ["/pages/wholesale.jpg"] },
};

export default function WholesalePage() {
  return (
    <>
      <PageHero
        eyebrow="Wholesale partners"
        title="Grow your business with us"
        intro="Driving dealer growth for over 15 years with expert vehicle valuation, acquisition and supply."
        image="/pages/wholesale.jpg"
        imageAlt="A grey Audi R8 on a mountain road with a Meridian number plate"
        imagePosition="40% 65%"
      >
        <ButtonLink href="#join" tone="light">Become a partner</ButtonLink>
      </PageHero>

      <PageBody>
        <PageSection
          first
          title="Why our valuations are more accurate"
          intro="We combine proprietary data, market expertise and a team of valuation experts to give the most accurate valuation of every vehicle."
        >
          <Points
            items={[
              { title: "Valuation", body: "Precise, data-driven pricing from a dedicated team of valuation experts." },
              { title: "Acquisition", body: "We source the stock your yard needs, quickly and reliably." },
              { title: "Supply", body: "Access to our wholesale inventory as a partner." },
            ]}
          />
        </PageSection>

        <section id="join" className="mt-16 grid scroll-mt-28 gap-12 border-t border-ink/15 pt-14 sm:mt-24 sm:pt-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">Join the partner program</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">Want to see our wholesale inventory? Become a wholesale partner and let&apos;s start chatting.</p>
          </div>
          <LeadForm
            type="wholesale"
            fields={["company", "message"]}
            messagePlaceholder="Tell us about your dealership and the stock you're after."
            submitLabel="Join the program"
          />
        </section>
      </PageBody>
    </>
  );
}
