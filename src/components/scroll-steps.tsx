"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BadgeNumber } from "./badge-icons";

const EASE_OUT = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const EASE_POP = "ease-[cubic-bezier(0.34,1.56,0.64,1)]";

/**
 * Numbered steps that play out as you scroll. On wide screens the section pins mid-screen while a line draws from
 * each badge to the next, and each step loads in as the line reaches it; once the last step is in, the page carries
 * on. On narrower screens the steps stack and load in one by one as they scroll into view, joined by a line down the
 * side. Without the script, or with reduced motion, every step shows and nothing pins.
 */
export function ScrollSteps({ title, steps }: { title: string; steps: { title: string; body: ReactNode }[] }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  // How many steps are showing; null until first measured, so the server render shows them all.
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const wrap = wrapper.current;
    const pin = pinned.current;
    const ol = list.current;
    if (!wrap || !pin || !ol) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = window.matchMedia("(min-width: 64rem)");
    const count = ol.children.length;

    // Progress through the steps: -1 before the first, then i..i+1 while the line runs from step i to the next.
    const progress = () => {
      const vh = window.innerHeight;
      if (wide.matches) {
        if (ol.getBoundingClientRect().top > vh * 0.8) return -1;
        // How far the pinned block has slid down its wrapper: 0 as it pins, 1 as it lets go.
        const travel = wrap.offsetHeight - pin.offsetHeight;
        const slid = (pin.getBoundingClientRect().top - wrap.getBoundingClientRect().top) / travel;
        return Math.min(Math.max(slid, 0), 1) * count;
      }
      const trigger = vh * 0.75;
      const tops = [...ol.children].map((li) => li.getBoundingClientRect().top);
      const i = tops.findLastIndex((top) => top <= trigger);
      if (i < 0) return -1;
      if (i === count - 1) return count - 1;
      return i + (trigger - tops[i]) / (tops[i + 1] - tops[i]);
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const t = progress();
      wrap.style.setProperty("--t", String(t));
      setShown(Math.min(Math.floor(t) + 1, count));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    wide.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      wide.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <section className="mt-16 border-t border-ink/15 sm:mt-24">
      <div ref={wrapper}>
        <div ref={pinned} className="pt-14 sm:pt-20 lg:motion-safe:sticky lg:motion-safe:top-[max(1rem,calc(50svh-14rem))]">
          <h2 className="max-w-4xl font-classic text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">{title}</h2>
          <ol ref={list} className="mt-10 grid gap-y-12 sm:mt-12 lg:grid-cols-3 lg:gap-x-10">
            {steps.map((step, i) => {
              const on = shown === null || i < shown;
              return (
                <li key={step.title} className="relative flex gap-5 lg:block">
                  {i < steps.length - 1 && (
                    // Track to the next badge: down the side when stacked, across when in a row. Fills with scroll.
                    <span
                      aria-hidden
                      className="absolute left-[45px] top-[92px] h-[calc(100%-92px+3rem+2px)] w-0.5 rounded-full bg-ink/10 lg:left-[96px] lg:top-[45px] lg:h-0.5 lg:w-[calc(100%+2.5rem+2px-96px)]"
                    >
                      <span
                        className={`block h-full w-full origin-top rounded-full bg-linear-to-b from-cobalt to-accent transition-transform duration-150 ease-out [transform:scaleY(var(--fill))] lg:origin-left lg:bg-linear-to-r lg:[transform:scaleX(var(--fill))]`}
                        style={{ "--fill": `clamp(0, var(--t, ${steps.length}) - ${i}, 1)` } as CSSProperties}
                      />
                    </span>
                  )}
                  <BadgeNumber
                    n={i + 1}
                    tone={i}
                    className={`relative h-24 w-24 transition-[opacity,scale] duration-700 ${EASE_POP} ${on ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
                  />
                  <div
                    className={`pt-5 transition-[opacity,translate,filter] duration-900 lg:pt-0 ${EASE_OUT} ${
                      on ? "opacity-100 delay-150" : "translate-y-[22px] opacity-0 blur-[6px]"
                    }`}
                  >
                    <h3 className="text-2xl font-semibold tracking-tight lg:mt-6">{step.title}</h3>
                    <div className="mt-3 text-lg leading-relaxed text-ink/70">{step.body}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        {/* The scroll distance the pinned steps play out over. */}
        <div aria-hidden className="hidden h-[150svh] lg:motion-safe:block" />
      </div>
    </section>
  );
}
