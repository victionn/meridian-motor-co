import type { Metadata } from "next";
import { FinanceCalculator } from "@/components/finance-calculator";
import { LeadForm } from "@/components/lead-form";
import { ButtonLink, CertifiedSection, PageBody, PageHero, PageSection, Points } from "@/components/page";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Car finance",
  description: "Tailored vehicle finance from Australia's leading lenders, with same-day approvals. Estimate your repayments and talk to our finance specialists.",
  alternates: { canonical: "/finance" },
  openGraph: { images: ["/pages/finance.jpg"] },
};

const FAQS = [
  {
    q: "How does a balloon payment work?",
    a: "A balloon payment is a one-off lump sum you agree to pay your lender at the end of the loan term. Because it covers a large part of the loan, your regular repayments are lower. Balloon payments are only available on fixed-rate car loans, not variable ones.",
  },
  {
    q: "What is pre-approval?",
    a: "Pre-approval (also called preliminary approval) is an offer from a lender to lend you an agreed amount, subject to full approval. Getting it before you negotiate can save a lot of time. How long it lasts and its terms vary by lender.",
  },
  {
    q: "What are the advantages of using a broker?",
    a: "A broker gives you access to a range of lenders through one application. It saves you meeting lenders one at a time, lets lenders compete for your business, and avoids the damage to your credit score that comes from applying with several lenders yourself.",
  },
  {
    q: "How long do applications take to approve and settle?",
    a: "It depends on the loan terms, the vehicle and the applicant. You can speed things up by sending any requested information quickly — approvals and settlement can often happen on the same day.",
  },
];

export default function FinancePage() {
  return (
    <>
      <PageHero
        eyebrow="Finance"
        title="Tailored solutions"
        intro="Our specialists deliver the best vehicle finance with same-day approvals, tailoring a solution that suits you from Australia's top lenders."
        // The clip's first frame is this exact photo, so the hand-over from photo to motion is invisible.
        image="/pages/finance.jpg"
        imageAlt="An Audi RS7 and RS6 parked side by side, both with Meridian number plates"
        imagePosition="60% 70%"
        // Only the headlights change (animation taken from the Higgsfield take): RS6 switches on at ~0.6 s, RS7 at ~1.2 s, then the clip holds on its last frame.
        video={[
          { src: "/pages/finance-hero-mobile.mp4", type: "video/mp4", media: "(max-width: 767px)" },
          { src: "/pages/finance-hero-desktop.webm", type: "video/webm" },
          { src: "/pages/finance-hero-desktop.mp4", type: "video/mp4" },
        ]}
        videoOnce
      >
        <ButtonLink href="#enquire" tone="light">Enquire now</ButtonLink>
        <ButtonLink href={site.phone.href} tone="light" variant="secondary">Call {site.phone.display}</ButtonLink>
      </PageHero>

      <PageBody>
        <PageSection first title="Finance, made straightforward">
          <Points
            items={[
              { icon: "bank", title: "14+ lenders", body: "We secure the best deal by comparing products from Australia's leading lenders." },
              { icon: "advisor", title: "Expert advisors", body: "An experienced, straightforward and honest approach to vehicle finance." },
              { icon: "bolt", title: "Fast settlement", body: "An automated application process means we can approve and settle on the same day." },
            ]}
          />
        </PageSection>

        <PageSection title="How it works">
          <Points
            numbered
            items={[
              { title: "Pre-approval", body: "Choose a quick application over the phone or online." },
              { title: "Secure your car", body: "Select your car and secure it with a deposit." },
              { title: "Settle and drive away", body: "Drive away in your new car as soon as finance settles." },
            ]}
          />
        </PageSection>

        <PageSection title="Estimate your repayments" intro="A guide only: quoted repayments do not include lender fees and charges.">
          <FinanceCalculator />
        </PageSection>

        <PageSection title="Frequently asked questions">
          <div className="max-w-4xl divide-y divide-ink/15 border-y border-ink/15">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cobalt/10 text-cobalt transition-colors group-open:bg-accent group-open:text-ink">
                    <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M8 2v12M2 8h12" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </PageSection>

        <section id="enquire" className="mt-16 grid scroll-mt-28 gap-12 border-t border-ink/15 pt-14 sm:mt-24 sm:pt-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">Ready to start your car loan application?</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
              Tell us a little about what you&apos;re after and a finance specialist will call you for an obligation-free consultation. Still looking for a car? Browse the showroom first.
            </p>
            <div className="mt-8">
              <ButtonLink href="/cars" variant="secondary">Browse the showroom</ButtonLink>
            </div>
          </div>
          <LeadForm type="finance" messagePlaceholder="The car you're interested in, the amount you'd like to borrow, or any questions." submitLabel="Enquire now" />
        </section>

        <CertifiedSection />
      </PageBody>
    </>
  );
}
