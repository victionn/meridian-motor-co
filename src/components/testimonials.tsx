import Image from "next/image";
import { site } from "@/content/site";
import { Carousel } from "./carousel";
import { Stars } from "./review-ratings";

/**
 * Customer testimonials on the home page, as a sideways-scrolling row that runs the full width of the window
 * (same gutters as the header): two and a half cards show on a laptop, three and a half on a wide monitor. Quotes come from site.testimonials;
 * renders nothing if there are none. Text sits on top and the photo at the foot of each card, so quotes,
 * names and photos each line up across the row.
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
                <div className="flex flex-1 flex-col pb-6">
                  <Stars rating={t.rating} />
                  <blockquote className="mt-5 flex-1 font-display text-lg leading-relaxed lg:text-xl lg:leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 border-t border-ink/10 pt-4 text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="block text-ink/60">{t.detail}</span>
                  </figcaption>
                </div>
                {t.image && (
                  <div className="relative aspect-3/2 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={t.image} alt={t.imageAlt ?? ""} fill sizes="(min-width: 1800px) 27vw, (min-width: 1024px) 36vw, (min-width: 640px) 416px, 85vw" className="object-cover" />
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
