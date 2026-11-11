"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const FADE = "4.5rem";

/**
 * A row of cards that scrolls sideways (swipe, trackpad or the arrow buttons), snapping card by card.
 * Whichever edge has more cards beyond it fades out and gets an arrow; both disappear at the ends.
 * Phones get neither (the next card peeks in and you swipe), since a fade there would sit over the card being read.
 * Children must be <li> elements.
 */
export function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const left = el.scrollLeft > 4;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
      setMore((m) => (m.left === left && m.right === right ? m : { left, right }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * ((card?.offsetWidth ?? el.clientWidth) + gap), behavior: "smooth" });
  };

  const mask = `linear-gradient(to right, ${more.left ? "transparent" : "#000"}, #000 ${FADE}, #000 calc(100% - ${FADE}), ${more.right ? "transparent" : "#000"})`;

  return (
    <div className="relative">
      <ul
        ref={track}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto lg:gap-10 [scrollbar-width:none] sm:[mask-image:var(--fade)] [&::-webkit-scrollbar]:hidden"
        style={{ "--fade": mask } as CSSProperties}
      >
        {children}
      </ul>
      <Arrow side="left" show={more.left} onClick={() => step(-1)} />
      <Arrow side="right" show={more.right} onClick={() => step(1)} />
    </div>
  );
}

function Arrow({ side, show, onClick }: { side: "left" | "right"; show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      tabIndex={show ? 0 : -1}
      className={`absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink/20 bg-paper text-ink shadow-md transition-opacity hover:border-ink sm:grid ${
        side === "left" ? "left-2" : "right-2"
      } ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={side === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} />
      </svg>
    </button>
  );
}
