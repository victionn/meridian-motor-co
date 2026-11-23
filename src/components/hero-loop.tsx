"use client";

import { useEffect, useRef } from "react";

/**
 * A short, seamlessly looping clip laid over a page header's still photo, so the photo reads as a living image.
 * The still stays underneath: it is what paints first, and what visitors with reduced motion or data saver keep.
 */
export function HeroLoop({ sources, position }: { sources: { src: string; type: string; media?: string }[]; position?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop
      playsInline
      disablePictureInPicture
      tabIndex={-1}
      preload="auto"
      // Fades in once playing, so the hand-over from the still is invisible.
      onPlaying={(e) => e.currentTarget.classList.replace("opacity-0", "opacity-100")}
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
      style={position ? { objectPosition: position } : undefined}
    >
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} media={s.media} />
      ))}
    </video>
  );
}
