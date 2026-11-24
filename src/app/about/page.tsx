import type { Metadata } from "next";
import { ButtonLink, CertifiedSection, ContactDetails, PageBody, PageHero, PageSection, Points } from "@/components/page";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About us",
  description: "Meridian Motor Co is Sydney's destination for luxury, sports and classic cars you won't find anywhere else — with over half a century of combined experience.",
  alternates: { canonical: "/about" },
  openGraph: { images: ["/pages/about.jpg"] },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Cars you won't find anywhere else"
        intro="The destination for a collection of luxury, sports and classic cars, in Lane Cove West, Sydney."
        image="/pages/about.jpg"
        imageAlt="The Meridian Motor Co showroom at dusk"
        imagePosition="40% 50%"
      >
        <ButtonLink href="/contact" tone="light">Get in touch</ButtonLink>
      </PageHero>

      <PageBody>
        <section className="grid gap-12 pt-14 sm:pt-20 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <h2 className="font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">This is why we created Meridian Motor Co</h2>
          <div className="space-y-6 text-xl leading-[1.6] sm:text-[1.35rem]">
            <p>
              At Meridian Motor Co, we believe a passion for fine motor vehicles is the driving force behind our business. Our founder&apos;s love of cars, and the desire to share that passion with
              others, led to the creation of our dealership.
            </p>
            <p>
              We recognised a gap in the market for a dealership offering exclusive access to cars that can&apos;t be found elsewhere. Visit our showroom to browse a curated range of
              exclusive marques and models, including rare European, luxury and sports cars — with a team on hand that brings over half a century of combined experience.
            </p>
            <div className="pt-2">
              <ButtonLink href="/cars">Browse the showroom</ButtonLink>
            </div>
          </div>
        </section>

        <PageSection title="Why Meridian Motor Co">
          <Points
            columns={4}
            items={[
              { icon: "gem", title: "Rare and exclusive", body: "A curated range of rare European, luxury and sports cars you won't find anywhere else." },
              { icon: "medal", title: "Half a century of experience", body: "A team that brings over 50 years of combined experience to every car we sell." },
              { icon: "shield", title: "Certified cars", body: "Every car is inspected and detailed, with extended warranty options available." },
              { icon: "pin", title: "Lane Cove West showroom", body: "Visit the showroom to see the collection in person, seven days a week." },
            ]}
          />
        </PageSection>

        <PageSection
          title="Careers at Meridian Motor Co"
          intro="A company that's as driven as you are. If you'd like to take your automotive career to the next level, we'd love to hear from you."
        >
          <ButtonLink href={`mailto:${site.email}?subject=${encodeURIComponent("Careers at Meridian Motor Co")}`} variant="secondary">
            Send us your CV
          </ButtonLink>
        </PageSection>

        <PageSection title="Find us">
          <ContactDetails />
        </PageSection>

        <CertifiedSection />
      </PageBody>
    </>
  );
}
