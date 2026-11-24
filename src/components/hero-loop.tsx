"use client";

import { useEffect, useRef } from "react";

/**
 * A short clip laid over a page header's still photo, so the photo reads as a living image. By default it loops
 * seamlessly; with `once` it plays through a single time and holds on its last frame.
 * The still stays underneath: it is what paints first, and what visitors with reduced motion or data saver keep.
 */
export function HeroLoop({
  sources,
  position,
  once = false,
}: {
  sources: { src: string; type: string; media?: string }[];
  position?: string;
  /** Play once and stop on the final frame instead of looping. */
  once?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.muted = true;
    // Play while on screen, pause while not. Leaving the page (Next keeps it, hidden) or scrolling away lets the
    // browser pause the clip, and nothing else would restart it. A play-once clip that has finished stays put.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!video.ended) video.play().catch(() => {});
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop={!once}
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
