"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Text that loads in as you scroll: inside this wrapper, headings rise out of a mask and paragraphs, list points,
 * forms and buttons fade up from a soft blur, each the first time it comes into view. Things that arrive together
 * are staggered, so a banner or a row of points loads in one after another.
 *
 * The hidden "before" state is pure CSS keyed to the same selector (see [data-reveal] in globals.css), so nothing
 * flashes before this script runs; it applies only with scripting on and no reduced-motion preference, and lifts
 * itself after a few seconds if this script never arrives.
 */

// Keep in step with the [data-reveal] rules in globals.css.
const TARGETS = [
  "h1",
  "h2",
  ":is(h1, h2) + div:not(:has(ul, ol, form))", // a heading's intro
  "p:not(li p, form p, dl p, figure p)",
  "li",
  "form",
  "a.rounded-full", // buttons
].join(", ");

const STAGGER = 0.08; // seconds between things that come into view together
const MAX_DELAY = 0.6;

export function TextReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.dataset.ready = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // A masked heading has no visible area, so the browser never reports it as in view: watch its container instead
    // (with threshold 0, since a container can be tall) and reveal the heading when that arrives.
    const revealsFor = new Map<Element, HTMLElement[]>();
    const reveal = (entries: IntersectionObserverEntry[], from: IntersectionObserver) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .flatMap((entry) => {
          from.unobserve(entry.target);
          return revealsFor.get(entry.target) ?? [];
        })
        .forEach((target, i) => {
          target.style.setProperty("--d", `${Math.min(i * STAGGER, MAX_DELAY)}s`);
          target.classList.add("in");
        });
    };
    const blocks = new IntersectionObserver((entries) => reveal(entries, blocks), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    const containers = new IntersectionObserver((entries) => reveal(entries, containers), { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    const tracked = new WeakSet<Element>();
    const track = (scope: Element) => {
      const found = [...(scope.matches(TARGETS) ? [scope] : []), ...scope.querySelectorAll(TARGETS)] as HTMLElement[];
      found.forEach((target) => {
        // Sections with their own entrance opt out with data-no-reveal (matching the CSS).
        if (tracked.has(target) || target.classList.contains("in") || target.closest("[data-no-reveal]")) return;
        tracked.add(target);
        const heading = target.matches("h1, h2") && target.parentElement;
        const watched = heading || target;
        revealsFor.set(watched, [...(revealsFor.get(watched) ?? []), target]);
        (heading ? containers : blocks).observe(watched);
      });
    };
    track(el);
    // Sections that stream in after the page (behind a Suspense boundary) get picked up as they arrive.
    const added = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach((node) => node instanceof Element && track(node))),
    );
    added.observe(el, { childList: true, subtree: true });
    return () => {
      added.disconnect();
      blocks.disconnect();
      containers.disconnect();
    };
  }, []);

  return (
    <div ref={root} data-reveal>
      {children}
    </div>
  );
}
