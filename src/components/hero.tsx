"use client";

import Link from "next/link";
import { useState } from "react";
import { type HeroClipId, HeroVideo } from "./hero-video";
import { ReviewRatings } from "./review-ratings";

/** The banner's messages. Lines of a headline are set on separate lines. */
const COPY = {
  showroom: {
    headline: ["Sydney’s Luxury", "Car Destination"],
    body: "We are proud to present a collection of hand-selected cars that you won’t find anywhere else.",
  },
  destination: {
    headline: ["The Destination to", "Buy, Service & Sell", "Your Luxury Car"],
    body: "We believe in taking care of all your motoring needs with the dependable, personalised service you deserve.",
  },
  garage: {
    headline: ["Meridian Garage", "Service And Repair"],
    body: "Exceptional cars require exceptional care, discover the full range of service and maintenance products.",
  },  sell: {
    headline: ["We Pay More For", "Luxury Cars"],
    body: "We will pay you more for your luxury car than other dealers.",
  },
};
type CopyId = keyof typeof COPY;
const ORDER = Object.keys(COPY) as CopyId[];

/** Which message each clip carries. Two clips may share one; the text then simply stays put across that change. */
const COPY_FOR: Record<HeroClipId, CopyId> = { rs7: "showroom", lexus: "destination", "280ce": "garage", a45: "sell" };

/** Home page banner: the looping footage with copy that changes as each clip fades in. */
export function Hero() {
  const [active, setActive] = useState<CopyId>(ORDER[0]);

  return (
    // Stops just short of the fold on desktop so the next section peeks in — the cue that the page continues.
    <section className="relative overflow-hidden md:h-[calc(100svh-4rem)] md:min-h-144">
      {/* Phones: footage on top, copy beneath. Desktop: copy and ratings sit middle left over the footage, search bottom left, the button bottom right. */}
      <div className="relative aspect-5/4 md:absolute md:inset-0 md:aspect-auto">
        <HeroVideo onShow={(clip) => setActive(COPY_FOR[clip])} />
      </div>
      <div className="edge-x relative pb-12 pt-2 md:flex md:h-full md:flex-col md:justify-center md:pb-[13svh] md:pt-16">
        <div className="md:[text-shadow:0_2px_30px_rgba(0,0,0,0.55)]">
          {/* All three sit in one grid cell, so the block keeps the height of the tallest and nothing below it jumps. */}
          <div className="grid">
            {ORDER.map((id, n) => {
              const Heading = n === 0 ? "h1" : "p";
              const on = id === active;
              return (
                <div
                  key={id}
                  aria-hidden={on ? undefined : true}
                  className={`col-start-1 row-start-1 self-end transition-opacity duration-1000 ease-in-out ${on ? "opacity-100" : "opacity-0"}`}
                >
                  <Heading className="font-classic text-[2.5rem] leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-[4.3vw] md:leading-[1.02]">
                    {COPY[id].headline.map((line) => (
                      <span key={line} className="block md:whitespace-nowrap">
                        {line}
                      </span>
                    ))}
                  </Heading>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:mt-[1.4vw] md:max-w-[27vw] md:text-[max(0.95rem,1.2vw)] md:text-paper/90">
                    {COPY[id].body}
                  </p>
                </div>
              );
            })}
          </div>
          <ReviewRatings className="mt-6 space-y-2.5 md:mt-[1.6vw] md:[text-shadow:0_1px_10px_rgba(0,0,0,0.6)]" />
        </div>
        {/* Stock search: a frosted pill the same height as the showroom button, bottom left on desktop and under the ratings on phones. */}
        <form
          action="/cars"
          method="get"
          className="mt-8 flex h-15 items-center rounded-full bg-paper/15 p-1.5 ring-1 ring-paper/15 backdrop-blur-md md:absolute md:bottom-[4svh] md:left-8 md:mt-0 md:h-23 md:w-[min(48rem,calc(100%-30rem))] md:p-2.5 lg:left-[5vw] lg:w-[min(48rem,calc(100%-10vw-26rem))]"
        >
          <label htmlFor="hero-q" className="sr-only">
            What car are you looking for?
          </label>
          <input
            id="hero-q"
            name="q"
            placeholder="What car are you looking for?"
            className="min-w-0 flex-1 bg-transparent pl-5 pr-2 text-lg text-paper md:pl-8 md:text-xl lg:text-[1.75rem] placeholder:text-paper/85 focus:outline-none"
          />
          <button aria-label="Search" className="flex h-full shrink-0 items-center gap-2.5 rounded-full bg-paper px-4 text-xs sm:px-5 md:gap-4 md:px-9 md:text-lg font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-accent-strong">
            {/* Phones show just the arrow, so the whole prompt fits in the field. */}
            <span className="max-sm:hidden">Search</span>
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 md:h-5 md:w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </form>
        {/* Twice the standard button size on desktop; full width on phones, where that would not fit. */}
        <Link
          href="/cars"
          className="btn-primary mt-4 w-full gap-4 py-4! text-lg! md:absolute md:bottom-[4svh] md:right-8 md:mt-0 md:w-auto md:gap-6 md:px-12! md:py-6! md:text-[1.75rem]! lg:right-[5vw]"
        >
          View showroom <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
