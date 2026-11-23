"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { Logo } from "./logo";

type Panel = "menu" | "search" | null;

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
    if (panel === "menu") document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [panel]);

  // On the home page the header floats, transparent, over the hero footage until the visitor scrolls.
  // Everywhere else (and once scrolled) it is dark frosted glass: the page shows through, blurred.
  const home = pathname === "/";
  const floating = home && !scrolled && !panel;
  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const half = Math.ceil(site.nav.length / 2);
  const leftNav = site.nav.slice(0, half);
  const rightNav = site.nav.slice(half);

  return (
    <header
      // Tabbing into a hidden header brings it back, so keyboard focus is never off screen.
      onFocus={() => setHidden(false)}
      className={`${home ? "fixed inset-x-0" : "sticky"} top-0 z-40 border-b transition-[translate,background-color,border-color] duration-300 ${
        floating ? "border-transparent bg-transparent" : "border-white/10 bg-ink/70 backdrop-blur-xl backdrop-saturate-150"
      } ${hidden && !panel ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className={`edge-x grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-300 ${floating ? "h-16" : "h-20 md:h-24"}`}>
        {/* Phones: a menu button that opens the full-screen panel below. */}
        <button
          type="button"
          aria-expanded={panel === "menu"}
          aria-controls="site-menu"
          aria-label={panel === "menu" ? "Close menu" : "Menu"}
          onClick={() => toggle("menu")}
          className="-ml-2 flex h-11 w-11 items-center justify-center justify-self-start text-paper transition-colors hover:text-accent lg:hidden"
        >
          <span aria-hidden className="relative block h-3.5 w-6">
            <span className={`absolute left-0 h-px w-6 bg-current transition ${panel === "menu" ? "top-1.75 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.75 h-px w-6 bg-current transition ${panel === "menu" ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-px w-6 bg-current transition ${panel === "menu" ? "top-1.75 -rotate-45" : "top-3.5"}`} />
          </span>
        </button>

        {/* Laptops and up: the page links sit in the bar itself, split either side of the logo (from site.nav). */}
        <nav aria-label="Main" className="-ml-2 hidden items-center gap-1 justify-self-start lg:flex xl:gap-3">
          {leftNav.map((item) => (
            <NavLink key={item.href} item={item} current={isCurrent(item.href)} />
          ))}
        </nav>

        {/* Always the roundel, never text. Over the hero it hangs full size below the transparent bar; once the bar
            turns to glass, the bar grows tall enough to hold the whole roundel at a size the lettering still reads. */}
        <Link href="/" aria-label={`${site.name} home`} className={`relative h-full transition-[width] duration-300 ${floating ? "w-24 md:w-40" : "w-[5.4rem] md:w-28"}`}>
          <Logo
            className={`absolute left-0 w-full text-paper transition-[top] duration-300 ${
              floating ? "top-2 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] md:top-3" : "top-1.5 md:top-1"
            }`}
          />
        </Link>

        <div className="-mr-2 flex items-center gap-1 justify-self-end xl:gap-3">
          <nav aria-label="More" className="hidden items-center gap-1 lg:flex xl:gap-3">
            {rightNav.map((item) => (
              <NavLink key={item.href} item={item} current={isCurrent(item.href)} />
            ))}
          </nav>
        <button
          type="button"
          aria-expanded={panel === "search"}
          aria-controls="site-search"
          aria-label={panel === "search" ? "Close search" : "Search stock"}
          onClick={() => toggle("search")}
          className="flex h-11 w-11 items-center justify-center text-paper transition-colors hover:text-accent"
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

      {panel === "menu" && (
        <div id="site-menu" className="absolute inset-x-0 top-full h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line/60 bg-ink lg:hidden">
          <div className="edge-x flex min-h-full flex-col justify-between gap-10 py-10">
            <nav aria-label="Main" className="flex flex-col gap-5">
              {site.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  onClick={() => setPanel(null)}
                  className="w-fit font-display text-4xl tracking-tight transition-colors hover:text-accent sm:text-5xl"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <a href={site.phone.href} className="btn-ghost w-full sm:w-fit">
              Call {site.phone.display}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ item, current }: { item: { label: string; href: string }; current: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={current ? "page" : undefined}
      className="relative flex h-11 items-center px-2 text-sm font-medium uppercase tracking-[0.18em] text-paper transition-colors after:absolute after:inset-x-2 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform hover:after:scale-x-100 aria-[current=page]:after:scale-x-100 xl:text-base"
    >
      {item.label}
    </Link>
  );
}
