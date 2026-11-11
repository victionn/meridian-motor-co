"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { Logo } from "./logo";

type Panel = "search" | null;

export function SiteHeader() {
  const pathname = usePathname();
  const [panel, setPanel] = useState<Panel>(null);
  const [scrolled, setScrolled] = useState(false);

  // Close when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanel(null);
  }

  // Slides away while scrolling down and returns on any scroll up, so it is out of the way while reading
  // but always one flick away.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // Ignore tiny movements (trackpad jitter, rubber-banding) and never hide near the top of the page.
      if (y < 80) setHidden(false);
      else if (y > lastY.current + 6) setHidden(true);
      else if (y < lastY.current - 6) setHidden(false);
      if (Math.abs(y - lastY.current) > 6) lastY.current = y;
    };
    lastY.current = window.scrollY;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  // On the home page the header floats over the hero footage until the visitor scrolls.
  const home = pathname === "/";
  const floating = home && !scrolled && !panel;
  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));

  return (
    <header
      // Tabbing into a hidden header brings it back, so keyboard focus is never off screen.
      onFocus={() => setHidden(false)}
      className={`${home ? "fixed inset-x-0" : "sticky"} top-0 z-40 border-b transition-[translate,background-color,border-color] duration-300 ${
        floating ? "border-transparent bg-transparent" : "border-line/60 bg-ink/90 backdrop-blur"
      } ${hidden && !panel ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="edge-x grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Page links sit in the bar itself (from site.nav); there is no menu to open. */}
        <nav aria-label="Main" className="-ml-2 flex items-center gap-1 justify-self-start sm:gap-3">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="flex h-11 items-center px-2 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:text-accent sm:text-base sm:tracking-[0.18em]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Always the roundel, never text: full size hanging below the bar over the hero, shrunk to sit inside the bar once it turns solid. */}
        <Link href="/" aria-label={`${site.name} home`} className={`relative h-16 transition-[width] duration-300 ${floating ? "w-24 md:w-40" : "w-[4.2rem]"}`}>
          <Logo
            className={`absolute left-0 w-full text-paper transition-[top] duration-300 ${
              floating ? "top-2 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] md:top-3" : "top-1.5"
            }`}
          />
        </Link>

        <button
          type="button"
          aria-expanded={panel === "search"}
          aria-controls="site-search"
          aria-label={panel === "search" ? "Close search" : "Search stock"}
          onClick={() => toggle("search")}
          className="-mr-2 flex h-11 w-11 items-center justify-center justify-self-end text-paper transition-colors hover:text-accent"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {panel === "search" ? (
              <path d="M5 5l14 14M19 5L5 19" />
            ) : (
              <>
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5L21 21" />
              </>
            )}
          </svg>
        </button>
      </div>

      {panel === "search" && (
        <div id="site-search" className="border-t border-line/60">
          <form action="/cars" method="get" onSubmit={() => setPanel(null)} className="edge-x flex items-center gap-3 py-4">
            <label htmlFor="site-q" className="sr-only">Search stock</label>
            <input
              id="site-q"
              name="q"
              autoFocus
              placeholder="Search make or model"
              className="flex-1 bg-transparent font-display text-2xl placeholder:text-muted focus:outline-none sm:text-3xl"
            />
            <button className="btn-primary px-5! py-2.5!">Search</button>
          </form>
        </div>
      )}
    </header>
  );
}
