import { useId, type ReactNode } from "react";

/**
 * Illustrated badges for the content pages. Each symbol is a solid silhouette of the thing itself (a shield, a heart,
 * a clock…) filled with a gradient, sitting on an offset copy of itself in a second colour, with white and contrast
 * details on top. Four colourways rotate so neighbouring badges never match:
 *
 *   0  cobalt on a peach shadow      1  tangerine on an ice-blue shadow
 *   2  cobalt on a tangerine shadow  3  tangerine on a cobalt shadow
 *
 * Drawn on a 24-unit grid. `shape` is the silhouette (it inherits the gradient fill, and is repeated as the shadow);
 * `back` sits behind it, `detail` on top. `D` is the colourway's contrast colour (tangerine on cobalt and vice versa).
 */

const D = "var(--badge-detail)";
const W = "white";

/** `noShadow` for line-drawn symbols, where an offset copy reads as clutter: they get a soft disc behind instead. */
type Glyph = { shape: ReactNode; detail?: ReactNode; back?: ReactNode; noShadow?: boolean };

const COG_TEETH = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => <rect key={a} x="10.2" y="1.6" width="3.6" height="4.6" rx="1.1" transform={`rotate(${a} 12 12)`} />);

const GLYPHS = {
  /** A bank: comparing lenders. */
  bank: {
    shape: (
      <>
        <path d="M12 2.5 21.5 8.3v2.2h-19V8.3z" />
        <rect x="4" y="12" width="2.8" height="6" rx="0.6" />
        <rect x="8.4" y="12" width="2.8" height="6" rx="0.6" />
        <rect x="12.8" y="12" width="2.8" height="6" rx="0.6" />
        <rect x="17.2" y="12" width="2.8" height="6" rx="0.6" />
        <rect x="2.5" y="19" width="19" height="2.8" rx="0.8" />
      </>
    ),
    detail: <circle cx="12" cy="7.2" r="1.6" fill={D} />,
  },
  /** A person with a speech bubble: an advisor. */
  advisor: {
    shape: (
      <>
        <circle cx="9.5" cy="8" r="4.2" />
        <path d="M1.8 21.8c0-4.6 3.5-8 7.7-8s7.7 3.4 7.7 8z" />
      </>
    ),
    detail: (
      <>
        <path d="M15.2 2h6.3A1.5 1.5 0 0 1 23 3.5v4.2a1.5 1.5 0 0 1-1.5 1.5h-2.3l-2.4 2.1V9.2h-1.6a1.5 1.5 0 0 1-1.5-1.5V3.5A1.5 1.5 0 0 1 15.2 2z" fill={D} />
        <circle cx="16.6" cy="5.6" r="0.8" fill={W} />
        <circle cx="18.35" cy="5.6" r="0.8" fill={W} />
        <circle cx="20.1" cy="5.6" r="0.8" fill={W} />
      </>
    ),
  },
  /** A lightning bolt with speed lines: fast. */
  bolt: {
    shape: <path d="M14.8 1.5 4.5 14.2h6.8l-1.6 8.3L20 9.6h-6.6z" />,
    detail: <path d="M1.2 7.5h3.6M.6 11.5h2.6M1.2 15.5h3" stroke={D} strokeWidth="1.8" />,
  },
  /** A clipboard with a tick: inspection. */
  inspection: {
    shape: <rect x="4" y="3.5" width="16" height="19" rx="2.5" />,
    detail: (
      <>
        <rect x="8" y="1.6" width="8" height="4.2" rx="1.2" fill={D} />
        <path d="m8 12.8 2.9 2.9 5.4-5.8" stroke={W} strokeWidth="2.2" />
        <path d="M8 19h8" stroke={W} strokeWidth="1.4" opacity="0.6" />
      </>
    ),
  },
  /** Sparkles: detailing. */
  sparkle: {
    shape: <path d="M10 1.5c.8 5 3.1 7.3 8.2 8.1-5.1.8-7.4 3.1-8.2 8.1-.8-5-3.1-7.3-8.2-8.1 5.1-.8 7.4-3.1 8.2-8.1z" />,
    detail: (
      <>
        <path d="M18.5 13c.4 2.2 1.3 3.1 3.5 3.5-2.2.4-3.1 1.3-3.5 3.5-.4-2.2-1.3-3.1-3.5-3.5 2.2-.4 3.1-1.3 3.5-3.5z" fill={D} />
        <circle cx="20.5" cy="4" r="1.2" fill={D} />
        <circle cx="10" cy="9.6" r="1.4" fill={W} />
      </>
    ),
  },
  /** A shield with a tick: warranty, certified. */
  shield: {
    shape: <path d="M12 1.8 20.5 5v6.6c0 5.4-3.6 9.4-8.5 11.2C7.1 21 3.5 17 3.5 11.6V5z" />,
    detail: (
      <>
        <path d="M12 1.8 20.5 5v6.6c0 5.4-3.6 9.4-8.5 11.2z" fill="black" opacity="0.14" />
        <path d="m8.2 12 2.6 2.6 5-5.2" stroke={W} strokeWidth="2.2" />
        <circle cx="12" cy="5.4" r="1" fill={D} />
      </>
    ),
  },
  /** A log book with a bookmark. */
  logbook: {
    shape: <path d="M6.8 2h13v17.2h-13A1.8 1.8 0 0 1 5 17.4V3.8A1.8 1.8 0 0 1 6.8 2z" />,
    detail: (
      <>
        <path d="M6.8 19.2h13V22h-13a1.4 1.4 0 0 1 0-2.8z" fill={W} />
        <path d="M14.5 2v7.5l-2.1-1.6-2.1 1.6V2z" fill={D} />
        <path d="M9 13h7.5M9 15.8h5" stroke={W} strokeWidth="1.4" opacity="0.8" />
      </>
    ),
  },
  /** A battery with a charge bolt: electrical diagnostics. */
  battery: {
    shape: (
      <>
        <rect x="1.5" y="6" width="18" height="13" rx="2.8" />
        <rect x="19" y="9.8" width="3.2" height="5.4" rx="1.2" />
      </>
    ),
    detail: (
      <>
        <rect x="3.8" y="8.3" width="13.4" height="8.4" rx="1.4" fill={W} opacity="0.25" />
        <path d="M12 7.6 7.6 13.3h3.7l-1 4 4.5-5.9h-3.7z" fill={D} />
      </>
    ),
  },
  /** A cog: mechanical repairs. */
  cog: {
    shape: (
      <>
        <circle cx="12" cy="12" r="7.4" />
        {COG_TEETH}
      </>
    ),
    detail: (
      <>
        <circle cx="12" cy="12" r="3.6" fill={W} />
        <circle cx="12" cy="12" r="1.7" fill={D} />
      </>
    ),
  },
  /** A snowflake: air conditioning. */
  snowflake: {
    noShadow: true,
    shape: <path d="M12 1.8v20.4M3.2 6.9l17.6 10.2M3.2 17.1l17.6-10.2M8.6 3.4 12 6.2l3.4-2.8M8.6 20.6 12 17.8l3.4 2.8" fill="none" strokeWidth="2.9" />,
    detail: (
      <>
        <circle cx="12" cy="12" r="2.7" fill={D} />
        <circle cx="3.2" cy="6.9" r="1.3" fill={D} />
        <circle cx="20.8" cy="17.1" r="1.3" fill={D} />
      </>
    ),
  },
  /** A cross-drilled brake disc and calliper. */
  brake: {
    shape: <circle cx="12" cy="12.5" r="9" />,
    detail: (
      <>
        <circle cx="12" cy="12.5" r="3.2" fill={W} />
        {[
          [18, 12.5],
          [13.85, 18.21],
          [7.15, 16.03],
          [7.15, 8.97],
          [13.85, 6.79],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.95" fill={W} />
        ))}
        <path d="M14 1.4a11.2 11.2 0 0 1 9.1 9.1l-3.7.6a7.4 7.4 0 0 0-6-6z" fill={D} />
      </>
    ),
  },
  /** A gear knob: transmission. */
  gearbox: {
    shape: (
      <>
        <circle cx="12" cy="7.5" r="6" />
        <rect x="10.6" y="12" width="2.8" height="7" />
        <path d="M5 22.5c0-3 3.1-4.8 7-4.8s7 1.8 7 4.8z" />
      </>
    ),
    detail: (
      <>
        <path d="M9.3 5.2v4.6M12 5.2v4.6M14.7 5.2v2.3M9.3 7.5h5.4" stroke={W} strokeWidth="1.3" />
        <rect x="8.4" y="16.4" width="7.2" height="1.8" rx="0.9" fill={D} />
      </>
    ),
  },
  /** A tyre with tread. */
  tyre: {
    shape: <circle cx="12" cy="12" r="10" />,
    detail: (
      <>
        <circle cx="12" cy="12" r="8.8" fill="none" stroke={W} strokeWidth="1.5" strokeDasharray="1.3 2.1" opacity="0.6" />
        <circle cx="12" cy="12" r="5.6" fill={W} />
        <circle cx="12" cy="12" r="2.4" fill={D} />
      </>
    ),
  },
  /** A five-spoke alloy with a sparkle: wheel refurbishment. */
  wheel: {
    shape: <circle cx="11" cy="13" r="9.5" />,
    detail: (
      <>
        <circle cx="11" cy="13" r="7" fill={W} />
        <path d="M11 13V7.2M11 13l5.5 1.8M11 13l3.4 4.7M11 13l-3.4 4.7M11 13l-5.5 1.8" stroke={D} strokeWidth="2" />
        <circle cx="11" cy="13" r="1.9" fill={D} />
        <path d="M20.5 .6c.3 1.7 1 2.4 2.7 2.7-1.7.3-2.4 1-2.7 2.7-.3-1.7-1-2.4-2.7-2.7 1.7-.3 2.4-1 2.7-2.7z" fill={D} />
      </>
    ),
  },
  /** A heart with a pulse: passion. */
  heart: {
    shape: <path d="M12 21.5S2.5 15.8 2.5 9.2A5 5 0 0 1 12 6.3a5 5 0 0 1 9.5 2.9c0 6.6-9.5 12.3-9.5 12.3z" />,
    detail: (
      <>
        <path d="M5.8 12.2h3.1l1.5-3 2.4 6 1.5-3h3.9" stroke={W} strokeWidth="1.9" />
        <circle cx="17.2" cy="7.6" r="1.2" fill={D} />
      </>
    ),
  },
  /** A garage with a roller door: the facility. */
  garage: {
    shape: <path d="M1.8 10.2 12 2.5l10.2 7.7v10.3a1.5 1.5 0 0 1-1.5 1.5H3.3a1.5 1.5 0 0 1-1.5-1.5z" />,
    detail: (
      <>
        <rect x="6.2" y="11.5" width="11.6" height="10.5" rx="1" fill={W} />
        <path d="M6.2 14.5h11.6M6.2 17.3h11.6M6.2 20.1h11.6" stroke={D} strokeWidth="1.3" />
        <circle cx="12" cy="7.6" r="1.3" fill={W} />
      </>
    ),
  },
  /** A clock: same-day. */
  clock: {
    shape: <circle cx="12" cy="12" r="10" />,
    detail: (
      <>
        <circle cx="12" cy="12" r="7.6" fill={W} opacity="0.18" />
        {[
          [12, 4.2],
          [19.8, 12],
          [12, 19.8],
          [4.2, 12],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" fill={W} />
        ))}
        <path d="M12 6.4V12l4 2.6" stroke={W} strokeWidth="2.2" />
        <circle cx="12" cy="12" r="1.6" fill={D} />
      </>
    ),
  },
  /** A calendar: since a year. */
  calendar: {
    shape: <rect x="2.5" y="4" width="19" height="18" rx="2.8" />,
    detail: (
      <>
        <path d="M2.5 6.8A2.8 2.8 0 0 1 5.3 4h13.4a2.8 2.8 0 0 1 2.8 2.8v2.7h-19z" fill={D} />
        <rect x="6.6" y="1.8" width="2.2" height="4.8" rx="1.1" fill={W} />
        <rect x="15.2" y="1.8" width="2.2" height="4.8" rx="1.1" fill={W} />
        {[
          [7, 13.2],
          [12, 13.2],
          [17, 13.2],
          [7, 17.6],
          [12, 17.6],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1" fill={W} />
        ))}
        <circle cx="17" cy="17.6" r="1.9" fill={D} />
      </>
    ),
  },
  /** A medal on ribbons: experience. */
  medal: {
    back: (
      <>
        <path d="M7.3 13.4 5.3 22.5l3.9-1.6 2.3 2.4 1.2-8.6z" fill={D} />
        <path d="m16.7 13.4 2 9.1-3.9-1.6-2.3 2.4-1.2-8.6z" fill={D} />
      </>
    ),
    shape: <circle cx="12" cy="9" r="7" />,
    detail: (
      <>
        <circle cx="12" cy="9" r="5" fill="none" stroke={W} strokeWidth="1" opacity="0.45" />
        <path d="m12 4.9 1.25 2.55 2.8.4-2.03 1.98.48 2.8L12 11.3l-2.5 1.33.48-2.8L7.95 7.85l2.8-.4z" fill={W} />
      </>
    ),
  },
  /** A cut gem: rare and exclusive. */
  gem: {
    shape: <path d="M6.5 3h11l5 6.5L12 22 1.5 9.5z" />,
    detail: (
      <>
        <path d="M8 9.5h8l-4 12.5z" fill={D} />
        <path d="M1.5 9.5h21M9.5 3 8 9.5l4 12.5 4-12.5L14.5 3" fill="none" stroke={W} strokeWidth="1" opacity="0.8" />
        <path d="M6.6 5.4 5.2 7.4" stroke={W} strokeWidth="1.3" />
      </>
    ),
  },
  /** A map pin: the showroom. */
  pin: {
    back: <ellipse cx="12" cy="22.4" rx="5.2" ry="1.3" fill={D} opacity="0.55" />,
    shape: <path d="M12 22.3s-7.5-6.6-7.5-12.5a7.5 7.5 0 0 1 15 0c0 5.9-7.5 12.5-7.5 12.5z" />,
    detail: (
      <>
        <circle cx="12" cy="9.8" r="3.4" fill={W} />
        <circle cx="12" cy="9.8" r="1.5" fill={D} />
      </>
    ),
  },
} satisfies Record<string, Glyph>;

export type BadgeIconName = keyof typeof GLYPHS;

/** The four colourways: [main gradient], [shadow gradient], contrast colour for details. */
const TONES = [
  { main: ["--color-cobalt", "--color-cobalt-deep"], shadow: ["--color-accent-soft", "--color-accent-soft"], detail: "--color-accent" },
  { main: ["--color-accent", "--color-accent-deep"], shadow: ["--color-cobalt-soft", "--color-cobalt-soft"], detail: "--color-cobalt" },
  { main: ["--color-cobalt", "--color-cobalt-deep"], shadow: ["--color-accent", "--color-accent-deep"], detail: "--color-accent" },
  { main: ["--color-accent", "--color-accent-deep"], shadow: ["--color-cobalt", "--color-cobalt-deep"], detail: "--color-cobalt" },
] as const;

function Badge({ glyph, tone = 0, className = "h-24 w-24" }: { glyph: Glyph; tone?: number; className?: string }) {
  const id = useId();
  const t = TONES[((tone % TONES.length) + TONES.length) % TONES.length];
  const stops = (key: string, [from, to]: readonly [string, string]) => (
    // userSpaceOnUse so every part of a multi-part silhouette (cog teeth, bank columns) shares one gradient.
    <linearGradient id={`${id}${key}`} gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
      <stop offset="0" style={{ stopColor: `var(${from})` }} />
      <stop offset="1" style={{ stopColor: `var(${to})` }} />
    </linearGradient>
  );
  return (
    <svg aria-hidden viewBox="0 0 64 64" className={`shrink-0 overflow-visible ${className}`}>
      <g
        transform="translate(4 4) scale(2.2)"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ ["--badge-detail" as string]: `var(${t.detail})` }}
      >
        <defs>
          {stops("m", t.main)}
          {stops("s", t.shadow)}
        </defs>
        {glyph.noShadow && <circle cx="13" cy="13" r="10.5" fill={`url(#${id}s)`} opacity="0.55" />}
        {glyph.back}
        {!glyph.noShadow && (
          <g transform="translate(2.1 2.1)" fill={`url(#${id}s)`} stroke={`url(#${id}s)`} strokeWidth="0">
            {glyph.shape}
          </g>
        )}
        <g fill={`url(#${id}m)`} stroke={`url(#${id}m)`} strokeWidth="0">
          {glyph.shape}
        </g>
        <g fill="none">{glyph.detail}</g>
      </g>
    </svg>
  );
}

/** An illustrated badge. `tone` picks the colourway (0–3; any integer wraps). */
export function BadgeIcon({ name, tone, className }: { name: BadgeIconName; tone?: number; className?: string }) {
  return <Badge glyph={GLYPHS[name]} tone={tone} className={className} />;
}

/** A badge carrying a step number (01, 02…) on a round silhouette. */
export function BadgeNumber({ n, tone, className }: { n: number; tone?: number; className?: string }) {
  return (
    <Badge
      tone={tone}
      className={className}
      glyph={{
        shape: <rect x="2" y="2" width="20" height="20" rx="7" />,
        detail: (
          <text x="12" y="16" textAnchor="middle" fill={W} fontSize="11" fontWeight="700" letterSpacing="-0.3" style={{ fontFamily: "var(--font-sans)" }}>
            {String(n).padStart(2, "0")}
          </text>
        ),
      }}
    />
  );
}
