import { cacheLife } from "next/cache";
import Link from "next/link";
import { site } from "@/content/site";
import { Logo } from "./logo";

/** Site footer: the roundel, showroom and garage details, every page link, and the social accounts. */
export function SiteFooter() {
  const address = `${site.showroom.street}, ${site.showroom.suburb} ${site.showroom.state} ${site.showroom.postcode}`;
  const heading = "text-sm font-medium uppercase tracking-[0.18em] text-paper/55";
  const link = "text-paper/85 transition-colors hover:text-paper";

  return (
    <footer className="bg-midnight text-paper [color-scheme:dark]">
      {/* A fine cobalt-to-tangerine rule along the top edge. */}
      <div aria-hidden className="h-0.5 bg-linear-to-r from-cobalt to-accent" />
      <div className="edge-x mx-auto max-w-[2400px] pb-16 pt-16 sm:pb-20 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label={`${site.name} home`} className="inline-block w-32">
              <Logo className="w-full text-paper" />
            </Link>
            <p className="mt-6 max-w-xs text-base leading-relaxed text-paper/70">{site.tagline}</p>
          </div>

          <div>
            <h2 className={heading}>Showroom</h2>
            <address className="mt-5 space-y-2 text-base not-italic leading-relaxed">
              <a href={site.showroom.mapsUrl} target="_blank" rel="noopener noreferrer" className={`block ${link}`}>{address}</a>
              <a href={site.phone.href} className={`block ${link}`}>{site.phone.display}</a>
              <a href={`mailto:${site.email}`} className={`block break-words ${link}`}>{site.email}</a>
              {site.showroom.hours.map((h) => (
                <span key={h.days} className="block text-paper/60">
                  {h.days}, {h.time}
                </span>
              ))}
            </address>
          </div>

          <div>
            <h2 className={heading}>{site.service.name}</h2>
            <div className="mt-5 space-y-2 text-base leading-relaxed">
              <a href={site.service.phone.href} className={`block ${link}`}>{site.service.phone.display}</a>
              <a href={`mailto:${site.service.email}`} className={`block break-words ${link}`}>{site.service.email}</a>
              {site.service.hours.map((h) => (
                <span key={h.days} className="block text-paper/60">
                  {h.days}, {h.time}
                </span>
              ))}
              <a href={site.service.bookingUrl} target="_blank" rel="noopener noreferrer" className={`block pt-2 font-medium underline underline-offset-4 ${link}`}>
                Book a service
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className={heading}>Explore</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-base xl:grid-cols-1">
              {[...site.nav, ...site.footer].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

      </div>

      {/* The copyright and social bar: a full-width black strip under the midnight footer. */}
      <div className="bg-ink">
        <div className="edge-x mx-auto flex max-w-[2400px] flex-wrap items-center justify-between gap-6 py-6 text-sm text-paper/55">
          <p>© <CopyrightYear /> {site.name}</p>
          <div className="flex items-center gap-5">
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Meridian Motor Co on Instagram" className={link}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Meridian Motor Co on Facebook" className={link}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** The current year, cached so the footer can still be prerendered (Next.js won't read the clock while prerendering). */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
