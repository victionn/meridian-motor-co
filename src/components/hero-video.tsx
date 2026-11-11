"use client";

import { useEffect, useRef, useState } from "react";

/** Below this width the hero uses the lighter 3:2 mobile cuts. */
const MOBILE = "(max-width: 767px)";

// Sources are listed smallest-first per clip; the browser takes the first it can play.
const clips = [
  {
    id: "rs7",
    sources: [
      { src: "/hero/rs7-hero-desktop.webm", type: "video/webm" },
      { src: "/hero/rs7-hero-desktop.mp4", type: "video/mp4" },
    ],
  },
  {
    id: "lexus",
    sources: [
      { src: "/hero/lexus-hero-desktop.webm", type: "video/webm" },
      { src: "/hero/lexus-hero-desktop.mp4", type: "video/mp4" },
    ],
  },
  {
    id: "280ce",
    sources: [
      { src: "/hero/280ce-hero-desktop.mp4", type: "video/mp4" },
      { src: "/hero/280ce-hero-desktop.webm", type: "video/webm" },
    ],
  },
  {
    id: "a45",
    sources: [
      { src: "/hero/a45-hero-desktop.webm", type: "video/webm" },
      { src: "/hero/a45-hero-desktop.mp4", type: "video/mp4" },
    ],
  },
] as const;

export type HeroClipId = (typeof clips)[number]["id"];

/** Length of the cross-fade, and how long before a clip's end the next one is started. */
const FADE_MS = 1200;
const LEAD_S = 1.6;

/**
 * Decorative hero background that should read as a living photograph, not a video being played. Nothing is ever
 * seen starting or frozen:
 * - every clip loops, so one that is still on screen can never stop on its last frame;
 * - the next clip is started early and only faded in once its picture is actually advancing;
 * - the clip underneath keeps running until the fade over it has finished, and is only then paused.
 * The first clip's poster is server-rendered underneath, so it is what paints first and what stays up for
 * visitors with reduced motion or data saver on.
 */
export function HeroVideo({ onShow }: { /** Called as each clip starts fading in. */ onShow?: (id: HeroClipId) => void }) {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  // `shown` fades in on top; `under` is the previous clip, kept opaque beneath it so the poster never shows through.
  const [layers, setLayers] = useState<{ shown: number | null; under: number | null }>({ shown: null, under: null });
  const shownRef = useRef<number | null>(null);
  const starting = useRef<number | null>(null);
  const timers = useRef<{ frame?: number; pause?: ReturnType<typeof setTimeout> }>({});
  const onShowRef = useRef(onShow);
  useEffect(() => {
    onShowRef.current = onShow;
  });

  /** Fade clip `i` in over whatever is showing, then pause everything it has covered. */
  function reveal(i: number) {
    starting.current = null;
    const previous = shownRef.current;
    shownRef.current = i;
    onShowRef.current?.(clips[i].id);
    setLayers({ shown: i, under: previous });
    // Start buffering the following clip so its hand-over is seamless.
    const following = videos.current[(i + 1) % clips.length];
    if (following && following.preload === "none") following.preload = "auto";
    clearTimeout(timers.current.pause);
    timers.current.pause = setTimeout(() => {
      videos.current.forEach((v, n) => {
        if (n !== shownRef.current && n !== starting.current) v?.pause();
      });
    }, FADE_MS + 200);
  }

  /** Start clip `i` playing and reveal it as soon as its picture is moving. */
  function start(i: number) {
    const video = videos.current[i];
    if (!video || starting.current === i || shownRef.current === i) return;
    starting.current = i;
    video.muted = true;
    video.currentTime = 0;
    video.play().catch(() => {});
    const began = performance.now();
    cancelAnimationFrame(timers.current.frame ?? 0);
    const check = () => {
      if (starting.current !== i) return;
      // Advancing, or (after 3s) at least playing — never leave the banner waiting on a stalled clip.
      if (!video.paused && (video.currentTime > 0.08 || performance.now() - began > 3000)) return reveal(i);
      timers.current.frame = requestAnimationFrame(check);
    };
    timers.current.frame = requestAnimationFrame(check);
  }

  useEffect(() => {
    const held = timers.current;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const begin = () => start(0);
    const cleanup = () => {
      window.removeEventListener("site-loader:ready", begin);
      cancelAnimationFrame(held.frame ?? 0);
      clearTimeout(held.pause);
    };
    // While the opening loader is up, hold on the first frame: starting at once would spend the clip's opening
    // seconds behind the black screen. The loader announces when its ring is complete, just before it lifts, so
    // the clip is already moving as the black fades.
    if (document.getElementById("site-loader")) window.addEventListener("site-loader:ready", begin, { once: true });
    else begin();
    return cleanup;
    // Runs once on mount; `start` only touches refs and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // `isolate` keeps the layer order below inside this box, so the clips cannot rise above the hero copy.
    <div aria-hidden className="absolute inset-0 isolate overflow-hidden">
      <picture>
        <source media={MOBILE} type="image/webp" srcSet="/hero/rs7-hero-mobile-poster.webp" />
        <source media={MOBILE} srcSet="/hero/rs7-hero-mobile-poster.jpg" />
        <source type="image/webp" srcSet="/hero/rs7-hero-desktop-poster.webp" />
        <img
          src="/hero/rs7-hero-desktop-poster.jpg"
          alt=""
          data-hero-poster
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {clips.map((clip, i) => (
        <video
          key={clip.id}
          ref={(el) => {
            videos.current[i] = el;
          }}
          data-hero-clip={i}
          muted
          playsInline
          disablePictureInPicture
          tabIndex={-1}
          loop
          preload={i === 0 ? "auto" : "none"}
          // Bring the next clip in while this one still has motion left (timeupdate fires about four times a second).
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (shownRef.current === i && v.duration && v.duration - v.currentTime <= LEAD_S) start((i + 1) % clips.length);
          }}
          style={layers.shown === i ? { transitionDuration: `${FADE_MS}ms` } : undefined}
          className={`absolute inset-0 h-full w-full object-cover ${
            layers.shown === i ? "z-2 opacity-100 transition-opacity ease-in-out" : layers.under === i ? "z-1 opacity-100" : "opacity-0"
          }`}
        >
          <source media={MOBILE} src={`/hero/${clip.id}-hero-mobile.mp4`} type="video/mp4" />
          {clip.sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      ))}

      {/* Scrims: keep the floating header, the copy on the left and the bottom call-to-action legible over the footage. */}
      <div className="absolute inset-x-0 top-0 z-3 h-40 bg-linear-to-b from-ink/75 to-transparent" />
      <div className="absolute inset-y-0 left-0 z-3 hidden w-3/5 bg-linear-to-r from-ink/70 via-ink/30 to-transparent md:block" />
      <div className="absolute inset-x-0 bottom-0 z-3 h-1/3 bg-linear-to-t from-ink to-transparent md:h-2/5 md:from-ink/90 md:via-ink/45" />
    </div>
  );
}
