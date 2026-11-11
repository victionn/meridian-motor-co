"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_RING, LogoWordmark } from "./logo";

/** Set once the loader has run, so coming back to the home page within the site doesn't replay it. */
let played = false;

// The ring is two arcs with a gap on the left where the lettering crosses. It is drawn as ONE clockwise sweep
// (angles in degrees clockwise from 3 o'clock about the ring's centre): from the lower right, under the bottom,
// up through the gap and over the top — so the line reads as continuous, bottom to top.
const CENTRE = "492.2 361.3";
const SWEEP_START = 31.1;
const SWEEP = 254.7;

/** What the loader waits for, and how much of the ring each is worth. */
const WEIGHTS = { page: 15, fonts: 20, poster: 30, video: 35 };
type Step = keyof typeof WEIGHTS;

// The loader adds well under a second of its own when everything is already loaded: a third of a second to draw the ring,
// a brief hold, then a 0.3s fade.
const MAX_SPEED = 300; // percent per second, so an instant load draws the ring in about 0.33s
const HOLD_MS = 80; // pause on the finished logo before the black lifts
const FADE_MS = 300; // matches the duration-300 on the overlay below
const GIVE_UP_MS = 7000; // never hold the visitor longer than this, whatever is still loading

/**
 * Opening loader for the home page: a black screen with the Meridian roundel sitting exactly where the header's
 * logo will be. The ring starts empty and is drawn in step with what has actually loaded (fonts, the banner's
 * first image and video); once complete the black fades away and the logo is left in place over the banner.
 * Server-rendered so it is the first thing painted; without JavaScript it is hidden by the <noscript> rule.
 */
export function SiteLoader() {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">(played ? "done" : "loading");
  const arc = useRef<SVGCircleElement>(null);
  const wordmark = useRef<SVGGElement>(null);

  useEffect(() => {
    if (played) return;
    const done: Record<Step, boolean> = { page: false, fonts: false, poster: false, video: false };
    const mark = (step: Step) => () => {
      done[step] = true;
    };
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Hold the page still while loading by swallowing scroll input. The scrollbar itself is left alone: hiding it
    // (overflow: hidden) widens the page, and bringing it back shifts the centred logo sideways as the loader lifts.
    const block = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if ([" ", "PageDown", "PageUp", "End", "Home", "ArrowDown", "ArrowUp"].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);
    const release = () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };

    if (document.readyState === "complete") done.page = true;
    else window.addEventListener("load", mark("page"), { once: true });

    document.fonts.ready.then(mark("fonts"));

    const poster = document.querySelector<HTMLImageElement>("[data-hero-poster]");
    if (!poster || poster.complete) done.poster = true;
    else {
      poster.addEventListener("load", mark("poster"), { once: true });
      poster.addEventListener("error", mark("poster"), { once: true });
    }

    const video = document.querySelector<HTMLVideoElement>("[data-hero-clip]");
    if (!video || video.readyState >= 3) done.video = true;
    else {
      video.addEventListener("canplay", mark("video"), { once: true });
      video.addEventListener("error", mark("video"), { once: true });
    }

    timers.push(setTimeout(() => (Object.keys(done) as Step[]).forEach((step) => (done[step] = true)), GIVE_UP_MS));

    const draw = (percent: number) => {
      const p = percent / 100;
      arc.current?.setAttribute("stroke-dasharray", `${p * SWEEP} 360`);
      if (wordmark.current) wordmark.current.style.opacity = String(0.35 + 0.65 * p);
    };

    let shown = 0;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const target = (Object.keys(done) as Step[]).reduce((sum, step) => sum + (done[step] ? WEIGHTS[step] : 0), 0);
      shown = Math.min(target, shown + ((now - last) / 1000) * MAX_SPEED);
      last = now;
      draw(shown);
      if (shown < 100) {
        frame = requestAnimationFrame(tick);
        return;
      }
      // Tells the banner to start its first clip (see hero-video.tsx), so it is already moving when the black lifts.
      window.dispatchEvent(new Event("site-loader:ready"));
      // Hold the finished logo for a beat, then lift the black away.
      timers.push(
        setTimeout(() => {
          played = true;
          release();
          setPhase("leaving");
          timers.push(setTimeout(() => setPhase("done"), FADE_MS + 20));
        }, HOLD_MS),
      );
    });

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      release();
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      id="site-loader"
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-100 bg-ink text-paper transition-opacity duration-300 ease-out ${phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <noscript>
        <style>{"#site-loader{display:none}"}</style>
      </noscript>
      {/* Same box as the header's logo (see site-header.tsx): centred, 6rem wide on phones and 10rem from md up. */}
      <svg aria-hidden viewBox="0 0 930 723" fill="currentColor" className="absolute left-1/2 top-2 w-24 -translate-x-1/2 md:top-3 md:w-40">
        <defs>
          <mask id="site-loader-ring" maskUnits="userSpaceOnUse" x="0" y="0" width="930" height="723">
            <circle
              ref={arc}
              cx="492.2"
              cy="361.3"
              r="348.6"
              fill="none"
              stroke="#fff"
              strokeWidth="40"
              pathLength={360}
              strokeDasharray="0 360"
              transform={`rotate(${SWEEP_START} ${CENTRE})`}
            />
          </mask>
        </defs>
        <g ref={wordmark} style={{ opacity: 0.35 }}>
          <LogoWordmark />
        </g>
        {/* Faint track of the full ring, with the loaded portion drawn over it. */}
        <path fillRule="evenodd" clipRule="evenodd" d={LOGO_RING} opacity="0.14" />
        <path fillRule="evenodd" clipRule="evenodd" d={LOGO_RING} mask="url(#site-loader-ring)" />
      </svg>
    </div>
  );
}
