import type { ReactNode } from "react";
import { site } from "@/content/site";

const STAR = "M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z";

/** Brand marks, drawn in one colour so they sit with the rest of the banner. */
const LOGOS: Record<string, ReactNode> = {
  Google: (
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  ),
  Facebook: (
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
  ),
};

/** Five stars with the rating shown as a filled portion (4.5 fills four and a half). */
export function Stars({ rating }: { rating: number }) {
  const row = (className: string) => (
    <svg aria-hidden viewBox="0 0 100 20" className={`h-4 w-20 ${className}`} fill="currentColor">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={STAR} transform={`translate(${i * 20})`} />
      ))}
    </svg>
  );
  return (
    <span className="relative inline-block">
      {row("opacity-30")}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${(rating / 5) * 100}%` }}>
        {row("")}
      </span>
    </span>
  );
}

/** Google and Facebook review ratings. Takes the surrounding text colour, so it works over the banner footage and on white. Figures come from site.reviews. */
export function ReviewRatings({ className = "" }: { className?: string }) {
  return (
    <ul className={className}>
      {site.reviews.map((r) => (
        <li key={r.source}>
          <a
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${r.rating} out of 5 on ${r.source}, ${r.note}`}
            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
              {LOGOS[r.source]}
            </svg>
            <Stars rating={r.rating} />
            <span className="text-[0.95rem] font-semibold">{r.rating.toFixed(1)}</span>
            <span className="text-sm opacity-70">{r.note}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
