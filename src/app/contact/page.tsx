import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { ButtonLink, ContactDetails, PageBody, PageHero, PageSection, Points } from "@/components/page";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Help & contact",
  description: "Contact Meridian Motor Co and Meridian Garage in Lane Cove West, Sydney: phone, email, opening hours, directions and an enquiry form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Help & contact"
        title="Contact us"
        intro="Whatever the question — a car in the showroom, finance, selling, servicing or after-sales — we're here to help."
      />

      <PageBody>
        <section className="grid gap-12 pt-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">Send us an enquiry</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
              A member of our team will be in touch shortly. For anything urgent, call us on{" "}
              <a href={site.phone.href} className="underline underline-offset-4">{site.phone.display}</a>.
            </p>
          </div>
          <LeadForm
            type="contact"
            fields={["reason", "message"]}
            reasons={["A car in the showroom", "Finance", "Selling or trading in", "Interstate delivery", "Service plan", "Extended warranty", "After-sales support"]}
          />
        </section>

        <PageSection title="Visit or call">
          <ContactDetails garage />
        </PageSection>

        <PageSection title="After-sales support" intro="Whatever the issue, big or small, we're here to help. Get in touch with us today.">
          <Points
            items={[
              { title: "Extended warranty", body: "Questions about your cover or making a claim." },
              { title: "Servicing and repairs", body: "Book in with Meridian Garage, our own service centre." },
              { title: "Interstate delivery", body: "Fast interstate transport, arranged for you." },
            ]}
          />
          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href={site.service.bookingUrl}>Book a service</ButtonLink>
            <ButtonLink href="/service" variant="secondary">Service plans and warranty</ButtonLink>
          </div>
        </PageSection>
      </PageBody>
    </>
  );
}
