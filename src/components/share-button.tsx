"use client";

import { useState } from "react";

/** Shares the current page: the device's share sheet where there is one, otherwise copies the link. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Dismissing the share sheet, or a blocked clipboard, needs no message.
    }
  }

  return (
    <button type="button" onClick={share} className={className}>
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
      <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10V2M5 4.5L8 1.5l3 3M3 8v5.5h10V8" />
      </svg>
    </button>
  );
}
