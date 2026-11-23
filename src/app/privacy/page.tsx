import type { Metadata } from "next";
import { PageBody, PageHero } from "@/components/page";
import policy from "@/content/privacy-policy.json";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Meridian Motor Co collects, uses, discloses and protects personal information.",
  alternates: { canonical: "/privacy" },
};

type Block = { h?: number; text?: string; p?: string; list?: string[] };

const address = `${site.showroom.street}, ${site.showroom.suburb} ${site.showroom.state} ${site.showroom.postcode}`;

/** The website privacy policy, word for word from the previous site (src/content/privacy-policy.json), with the current address. */
export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy policy" />
      <PageBody>
        <article className="max-w-3xl pt-6 text-lg leading-relaxed text-ink/80">
          {(policy as Block[]).map((b, i) => {
            if (b.h && b.h <= 3) {
              const Heading = b.h === 2 ? "h2" : "h3";
              return (
                <Heading key={i} className={`font-semibold tracking-tight text-ink ${b.h === 2 ? "mt-4 text-3xl" : "mt-12 text-2xl"}`}>
                  {b.text}
                </Heading>
              );
            }
            // Lower-level headings in the source are lead-in sentences to the list that follows.
            if (b.h) return <p key={i} className="mt-6 font-medium text-ink">{b.text}</p>;
            if (b.list)
              return (
                <ul key={i} className="mt-4 list-disc space-y-2 pl-6 marker:text-ink/40">
                  {b.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            if (b.p === "__INTRO__")
              return (
                <p key={i} className="mt-4">
                  In this Website Privacy Policy, &ldquo;we&rdquo;, &ldquo;our&rdquo; and &ldquo;us&rdquo; are all references to {site.name}, {address},{" "}
                  <a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a>, and references to &ldquo;this website&rdquo; or &ldquo;the website&rdquo; are
                  to our website, the homepage of which can be accessed via the URL meridianmotorco.com.au.
                </p>
              );
            return (
              <p key={i} className="mt-4">
                {b.p}
              </p>
            );
          })}

          <h3 className="mt-12 text-2xl font-semibold tracking-tight text-ink">Our contact details</h3>
          <p className="mt-4">
            Customer Service, {site.name}
            <br />
            {address}
            <br />
            <a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a>
          </p>
          <p className="mt-4">
            Office of the Australian Information Commissioner:{" "}
            <a href="https://www.oaic.gov.au/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">oaic.gov.au</a>
          </p>
        </article>
      </PageBody>
    </>
  );
}
