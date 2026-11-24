import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

/**
 * Home page: a strip straight under the hero — the year we started, a few lines on who we are, and the
 * showroom at dusk. White, so it opens the light part of the page under the dark hero.
 * Phones read year → text → photo; from `lg` the photo moves to the left of the text.
 */
export function IntroBand() {
  const label = "text-[0.72rem] font-medium uppercase tracking-[0.3em] text-ink/55";

  return (
    <section className="bg-paper text-ink [color-scheme:light]">
      <div className="edge-x mx-auto grid max-w-[2400px] gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-24">
        <div>
          <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
            <div>
              <p className={label}>Established</p>
              <p className="mt-3 font-classic text-7xl leading-none tracking-[-0.02em] sm:text-8xl">{site.established}</p>
            </div>
            <p className={`pb-2 ${label}`}>Classic · Luxury · Performance</p>
          </div>
          <div className="mt-10 border-t border-ink/15 pt-10">
            <p className="max-w-4xl font-classic text-2xl leading-[1.35] text-ink/90 sm:text-3xl sm:leading-[1.3]">
              Sydney&rsquo;s destination for classic, luxury and performance cars. Since {site.established} we&rsquo;ve curated rare European, prestige and collectable
              cars you won&rsquo;t find anywhere else — each one inspected and detailed before sale, and looked after by our own service centre in{" "}
              {site.showroom.suburb}.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-cobalt-deep transition-colors hover:text-cobalt"
            >
              Our story <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <div className="relative aspect-[1554/1038] overflow-hidden rounded-2xl lg:order-first">
          <Image
            src="/pages/showroom-exterior.webp"
            alt="The Meridian Motor Co showroom at dusk, lit up behind its tall windows"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
