import Image from "next/image";
import { site } from "@/content/site";
import { Carousel } from "./carousel";
import { SourceLogo, Stars } from "./review-ratings";

/**
 * Customer testimonials on the home page, as a sideways-scrolling row that runs the full width of the window
 * (same gutters as the header): two and a half cards show on a laptop, three and a half on a wide monitor.
 * Quotes come from site.testimonials; renders nothing if there are none.
 * Cards with a photo put the text on top and the photo at the foot, so names and photos line up across the row.
 * Cards without one are text only, with the name straight after the quote.
 */
export function Testimonials() {
  const items = site.testimonials;
  if (items.length === 0) return null;

  return (
    <section className="bg-paper text-ink">
      <div className="edge-x pb-16 sm:pb-20">
        <h2 className="heading mb-10">Testimonials</h2>

        <Carousel label="Customer testimonials">
          {items.map((t) => (
            <li key={t.name} className="w-[85%] shrink-0 snap-center sm:w-104 lg:w-[calc((100%-5rem)/2.5)] min-[112.5rem]:w-[calc((100%-7.5rem)/3.5)]">
              <figure className="flex h-full flex-col">
                <div className={`flex flex-col ${t.image ? "flex-1 pb-5" : ""}`}>
                  <div className="flex h-5 items-center justify-between gap-4">
                    <Stars rating={t.rating} />
                    <SourceLogo source={t.source} />
                  </div>
                  <blockquote className={`mt-4 font-display text-lg leading-relaxed lg:text-xl lg:leading-relaxed ${t.image ? "flex-1" : ""}`}>
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 text-base font-semibold">{t.name}</figcaption>
                </div>
                {t.image && (
                  <div className="relative aspect-3/2 shrink-0 overflow-hidden rounded-2xl bg-ink/5">
                    <Image
                      src={t.image}
                      alt={t.imageAlt ?? ""}
                      fill
                      sizes="(min-width: 1800px) 27vw, (min-width: 1024px) 36vw, (min-width: 640px) 416px, 85vw"
                      className="object-cover"
                      style={t.imagePosition ? { objectPosition: t.imagePosition } : undefined}
                    />
                  </div>
                )}
              </figure>
            </li>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
