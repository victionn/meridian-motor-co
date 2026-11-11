"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  // On the home page the header floats over the hero footage until the visitor scrolls.
  const home = pathname === "/";
  const floating = home && !scrolled && !panel;
  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));

  return (
    <header
      className={`${home ? "fixed inset-x-0" : "sticky"} top-0 z-40 border-b transition-colors duration-300 ${
        floating ? "border-transparent bg-transparent" : "border-line/60 bg-ink/90 backdrop-blur"
      }`}
    >
      <div className="edge-x grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <button
          type="button"
          aria-expanded={panel === "menu"}
          aria-controls="site-menu"
          onClick={() => toggle("menu")}
          className="-ml-2 flex h-10 items-center gap-3 justify-self-start px-2 text-xs font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:text-accent"
        >
          <span aria-hidden className="relative block h-3 w-5">
            <span className={`absolute left-0 h-px w-5 bg-current transition ${panel === "menu" ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-px w-5 bg-current transition ${panel === "menu" ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-px w-5 bg-current transition ${panel === "menu" ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
          <span className="max-sm:sr-only">{panel === "menu" ? "Close" : "Menu"}</span>
        </button>

        {floating ? (
          // Over the hero the full roundel hangs below the bar; once the bar turns solid it swaps to the wordmark.
          <Link href="/" className="relative h-16 w-24 md:w-40">
            <Logo className="absolute left-0 top-2 w-full text-paper md:top-3 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]" />
          </Link>
        ) : (
          <Link href="/" className="whitespace-nowrap font-display text-xl tracking-tight">
            Meridian <span className="text-accent">Motor Co</span>
          </Link>
        )}

        <button
          type="button"
          aria-expanded={panel === "search"}
          aria-controls="site-search"
          aria-label={panel === "search" ? "Close search" : "Search stock"}
          onClick={() => toggle("search")}
          className="-mr-2 flex h-10 w-10 items-center justify-center justify-self-end text-paper transition-colors hover:text-accent"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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

      {panel === "menu" && (
        <div id="site-menu" className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line/60 bg-ink">
          <div className="edge-x flex min-h-full flex-col justify-between gap-10 py-10">
            <nav aria-label="Main" className="flex flex-col gap-5">
              {site.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
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
