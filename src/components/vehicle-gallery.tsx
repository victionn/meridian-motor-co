"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** Photo gallery for a car's page: one large photo with arrows, a counter, and a strip of thumbnails beneath. */
export function VehicleGallery({ images, alt }: { images: string[]; alt: string }) {
  const photos = images.length ? images : ["/placeholder-car.svg"];
  const [index, setIndex] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const many = photos.length > 1;
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);

  // Keep the active thumbnail in view as the visitor steps through.
  useEffect(() => {
    strip.current?.children[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [index]);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${alt} photos`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div className="relative aspect-3/2 overflow-hidden rounded-2xl bg-ink">
        <Image
          key={photos[index]}
          src={photos[index]}
          alt={`${alt} — photo ${index + 1} of ${photos.length}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover"
        />
        {many && (
          <>
            <Arrow direction="prev" onClick={() => go(-1)} />
            <Arrow direction="next" onClick={() => go(1)} />
            <p aria-hidden className="absolute bottom-4 right-4 rounded-full bg-ink/75 px-3.5 py-1.5 text-xs font-medium tracking-[0.14em] text-paper backdrop-blur">
              {index + 1} / {photos.length}
            </p>
          </>
        )}
      </div>

      {many && (
        <div ref={strip} className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`relative aspect-3/2 w-28 shrink-0 overflow-hidden rounded-xl transition sm:w-36 ${
                i === index ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-65 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="144px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Arrow({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white ${
        direction === "prev" ? "left-4" : "right-4"
      }`}
    >
      <svg aria-hidden viewBox="0 0 16 16" className={`h-4 w-4 ${direction === "prev" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3l5 5-5 5" />
      </svg>
    </button>
  );
}
