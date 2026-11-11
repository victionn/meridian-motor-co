"use client";

import Script from "next/script";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/**
 * Hand-picked posts shown with Instagram's official embed (no API token needed).
 * Instagram's script swaps each blockquote for its own white card and sizes it; cards can't be narrower than 326px,
 * so they sit in a side-scrolling row rather than a grid.
 */
export function InstagramEmbeds({ urls }: { urls: readonly string[] }) {
  return (
    <>
      <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 xl:mx-0 xl:px-0">
        {urls.map((url) => (
          // `relative` matters: while a post loads, Instagram positions its frame absolutely, and without a positioned
          // parent it escapes the row and briefly makes the whole page wider on phones (shifting the header logo).
          <li key={url} className="relative w-[328px] shrink-0 snap-start overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{ margin: 0, width: "100%", minWidth: 326, border: 0, background: "#fff" }}
            >
              <a href={url} target="_blank" rel="noopener noreferrer" className="block p-6 text-sm text-ink underline">
                View this post on Instagram
              </a>
            </blockquote>
          </li>
        ))}
      </ul>
      {/* onReady also fires on client-side navigation back to this page, when the script is already loaded. */}
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" onReady={() => window.instgrm?.Embeds.process()} />
    </>
  );
}
