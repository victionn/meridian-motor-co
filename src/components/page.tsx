import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { BadgeIcon, BadgeNumber, type BadgeIconName } from "./badge-icons";
import { HeroLight, type HeroLightProps } from "./hero-light";
import { HeroLoop } from "./hero-loop";

/**
 * Building blocks for the content pages (Sell, Finance, Service, About, Contact, Wholesale, Privacy), in the same
 * language as the showroom and car pages: a photographic header, then white pages of open sections divided by fine
 * rules, classic serif headings and rounded black pill buttons.
 */

/** A light (white) page body, full width with the header's gutters. */
export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper text-ink [color-scheme:light]">
      <div className="edge-x mx-auto max-w-[2400px] pb-24">{children}</div>
    </div>
  );
}

/**
 * Photographic page header: the photo fills the width with the page title set over its lower left, like the home
 * banner but shorter. Without a photo it falls back to a plain white title block.
 */
export function PageHero({
  title,
  eyebrow,
  intro,
  image,
  imageAlt = "",
  imagePosition,
  video,
  light,
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  image?: string;
  imageAlt?: string;
  /** CSS object-position, to keep the car in frame when the photo is cropped. */
  imagePosition?: string;
  /** Optional looping clip played over the photo (the photo should be the clip's first frame). */
  video?: { src: string; type: string; media?: string }[];
  /** Optional living light drawn over the still photo (sun, rays, motes, road reflection, taillight). */
  light?: HeroLightProps;
  children?: ReactNode;
}) {
  if (!image) {
    return (
      <div className="bg-paper text-ink [color-scheme:light]">
        <div className="edge-x mx-auto max-w-[2400px] pb-6 pt-14 sm:pt-20">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-4 max-w-5xl font-classic text-5xl leading-[1.02] tracking-[-0.015em] sm:text-6xl lg:text-7xl">{title}</h1>
          {intro && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 sm:text-xl">{intro}</div>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      <div className="relative aspect-4/3 sm:aspect-16/9 md:aspect-auto md:h-[min(72svh,46rem)] md:min-h-[30rem]">
        <div className="absolute inset-0">
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" style={imagePosition ? { objectPosition: imagePosition } : undefined} />
          {video && <HeroLoop sources={video} position={imagePosition} />}
          {/* Shade the lower left, where the title sits, and the top under the header. */}
          <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/25 to-ink/30" />
          <div className="absolute inset-0 hidden bg-linear-to-r from-ink/60 via-ink/15 to-transparent md:block" />
          {/* The light goes over the shading, as a real flare sits on the lens rather than in the scene. */}
          {light && <HeroLight {...light} />}
        </div>
      </div>
      <div className="edge-x relative pb-10 pt-6 md:absolute md:inset-x-0 md:bottom-0 md:pb-14 md:[text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
        {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 max-w-4xl font-classic text-[2.75rem] leading-[1.02] tracking-[-0.015em] sm:text-6xl lg:text-7xl">{title}</h1>
        {intro && <div className="mt-5 max-w-2xl text-base leading-relaxed text-paper/85 sm:text-lg">{intro}</div>}
        {children && <div className="mt-7 flex flex-wrap gap-3 [text-shadow:none]">{children}</div>}
      </div>
    </section>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`flex items-center gap-4 text-[0.72rem] font-medium uppercase tracking-[0.3em] ${light ? "text-paper/75" : "text-ink/55"}`}>
      <span aria-hidden className="h-px w-10 bg-linear-to-r from-cobalt to-accent" />
      {children}
    </p>
  );
}

/** An open section divided from the one above by a fine rule, with a classic serif heading (as on the car pages). */
export function PageSection({
  title,
  intro,
  id,
  children,
  first = false,
}: {
  title: string;
  intro?: ReactNode;
  id?: string;
  children?: ReactNode;
  /** The first section after the header: no rule above it. */
  first?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-28 ${first ? "pt-14 sm:pt-20" : "mt-16 border-t border-ink/15 pt-14 sm:mt-24 sm:pt-20"}`}>
      <h2 className="max-w-4xl font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">{title}</h2>
      {intro && <div className="mt-5 max-w-3xl text-lg leading-relaxed text-ink/70">{intro}</div>}
      {children && <div className="mt-10 sm:mt-12">{children}</div>}
    </section>
  );
}

/** Black pill (primary) and outlined pill (secondary) links, matching the buttons on the car pages. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  tone = "dark",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  /** "light" for use over a photo. */
  tone?: "dark" | "light";
  external?: boolean;
}) {
  const styles = {
    "primary-dark": "cta-cobalt",
    "secondary-dark": "border border-cobalt/40 text-cobalt-deep transition-colors hover:border-cobalt hover:bg-cobalt/5",
    "primary-light": "cta-accent",
    "secondary-light": "border border-paper/50 text-paper transition-colors hover:border-paper",
  }[`${variant}-${tone}`];
  const className = `inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 text-[0.8rem] font-medium uppercase tracking-[0.16em] ${styles}`;
  const content = (
    <>
      {children} <span aria-hidden>→</span>
    </>
  );
  if (external || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={className} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

/**
 * A row of short points (title + sentence): the site's stand-in for the icon "feature boxes" on the old pages. Each
 * point can carry an illustrated badge (`icon`); `numbered` gives step-by-step points a numbered badge instead.
 * Points without a badge are separated by fine rules. `dark` for a midnight band.
 */
export function Points({
  items,
  numbered = false,
  columns = 3,
  dark = false,
}: {
  items: { title: string; body: ReactNode; icon?: BadgeIconName }[];
  numbered?: boolean;
  columns?: 2 | 3 | 4;
  dark?: boolean;
}) {
  const grid = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 xl:grid-cols-4" }[columns];
  return (
    <ol className={`grid gap-x-10 gap-y-12 ${grid}`}>
      {items.map((item, i) => {
        // Rotate the badge colourways, shifting one per row so a badge never matches its neighbour or the one above.
        const tone = i + Math.floor(i / columns);
        return (
        <li key={item.title} className={numbered || item.icon ? "" : `border-t pt-6 ${dark ? "border-paper/20" : "border-ink/20"}`}>
          {numbered ? <BadgeNumber n={i + 1} tone={tone} /> : item.icon && <BadgeIcon name={item.icon} tone={tone} />}
          <h3 className={`text-2xl font-semibold tracking-tight ${numbered || item.icon ? "mt-6" : ""}`}>{item.title}</h3>
          <div className={`mt-3 text-lg leading-relaxed ${dark ? "text-paper/70" : "text-ink/70"}`}>{item.body}</div>
        </li>
        );
      })}
    </ol>
  );
}

/** A tick list in the site's style: white ticks in small cobalt discs. */
export function TickList({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-lg leading-snug">
          <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-linear-to-br from-cobalt to-cobalt-deep">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.5l3.2 3.2L13 5" />
            </svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Meridian Motor Co Certified": the three promises every car carries (the block that closes most pages on the old
 * site). A full-width midnight band that runs straight into the footer: the box-shadow + clip-path pair paints the
 * band out to the window edges past the page's gutters and max width, and -mb-24 cancels PageBody's bottom padding.
 */
export function CertifiedSection() {
  return (
    <section className="-mb-24 mt-16 bg-midnight pb-20 pt-14 text-paper shadow-[0_0_0_100vmax_var(--color-midnight)] [clip-path:inset(0_-100vmax)] [color-scheme:dark] sm:mt-24 sm:pb-28 sm:pt-20">
      <Eyebrow light>Our promise</Eyebrow>
      <h2 className="mt-4 max-w-4xl font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">Meridian Motor Co Certified</h2>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-paper/75">With a Meridian Motor Co Certified vehicle, you will drive away with ultimate peace of mind.</p>
      <div className="mt-10 sm:mt-12">
        <Points
          dark
          items={[
            { icon: "inspection", title: "Safety and quality inspection", body: "We meticulously evaluate every car against our mechanical checklist to ensure it meets age and mileage expectations." },
            { icon: "sparkle", title: "Detailing", body: "Our attention to detail makes all the difference. Every car we offer undergoes a comprehensive detailing process to look its very best." },
            { icon: "shield", title: "Manufacturer-style warranty", body: "Meridian Motor Co Certified vehicles come with the choice of manufacturer-style extended warranties, for a trouble-free driving experience." },
          ]}
        />
      </div>
    </section>
  );
}

/** Contact details for the showroom (and optionally Meridian Garage), as a ruled block. */
export function ContactDetails({ garage = false }: { garage?: boolean }) {
  const blocks = [
    {
      name: site.name,
      phone: site.phone,
      email: site.email,
      label: "Sales hours",
      hours: site.showroom.hours,
    },
    ...(garage ? [{ name: site.service.name, phone: site.service.phone, email: site.service.email, label: "Garage hours", hours: site.service.hours }] : []),
  ];
  const address = `${site.showroom.street}, ${site.showroom.suburb} ${site.showroom.state} ${site.showroom.postcode}`;
  return (
    <div className={`grid gap-x-12 gap-y-12 ${garage ? "lg:grid-cols-2" : ""}`}>
      {blocks.map((b) => (
        <div key={b.name} className="border-t border-ink/20 pt-6">
          <h3 className="text-2xl font-semibold tracking-tight">{b.name}</h3>
          <dl className="mt-6 grid gap-x-10 gap-y-6 text-lg sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.14em] text-cobalt">Phone</dt>
              <dd className="mt-1">
                <a href={b.phone.href} className="underline-offset-4 hover:underline">{b.phone.display}</a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.14em] text-cobalt">Email</dt>
              <dd className="mt-1 break-words">
                <a href={`mailto:${b.email}`} className="underline-offset-4 hover:underline">{b.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.14em] text-cobalt">Address</dt>
              <dd className="mt-1">
                {address}
                <br />
                <a href={site.showroom.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-base font-medium underline underline-offset-4">
                  Get directions
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.14em] text-cobalt">{b.label}</dt>
              <dd className="mt-1">
                {b.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: {h.time}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}

/** A photo with rounded corners, for use inside sections. */
export function Photo({ src, alt, className = "aspect-3/2" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink/5 ${className}`}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
    </div>
  );
}
