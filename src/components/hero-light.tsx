import type { CSSProperties } from "react";

/**
 * Living light over a still page-header photo, drawn in CSS so the photo itself stays pixel-sharp (no video). Kept to
 * what a camera would actually see, so it reads as the photo, not as an effect: the sun's glow breathing, a few broad
 * soft shafts of light through the haze, the odd speck of dust catching the light, a shimmer on the road and an
 * optional taillight glow.
 *
 * The effects sit in a frame the exact size and offset of the photo as `object-fit: cover` crops it (worked out from
 * the photo's aspect ratio and object-position with container query units), so every effect stays pinned to its
 * spot in the photo at any window size. All positions are percentages of the photo.
 *
 * Motion stops for visitors who ask for reduced motion; the light stays, still.
 */

type Pt = [x: number, y: number];

export type HeroLightProps = {
  /** The photo's width ÷ height. */
  ratio: number;
  /** The photo's CSS object-position, as [x%, y%] (50, 50 for centred). */
  position?: Pt;
  /** Centre of the sun. */
  sun: Pt;
  /** Centre of the sun's reflection on the road, with its [width, height]. */
  glint?: { at: Pt; size: Pt };
  /** A light strip to glow: its two ends. */
  taillight?: { from: Pt; to: Pt; thickness: number };
};

// Dust motes around the sun, fixed so server and client render the same: x, y (as offsets from the sun, in % of the
// photo), size (px), duration (s), delay (s), sideways drift (px), peak opacity.
const MOTES: [number, number, number, number, number, number, number][] = [
  [-10, 12, 3.5, 16, -3, 18, 0.7],
  [-4, 24, 3, 18, -11, -14, 0.6],
  [3, 8, 4, 17, -7, 14, 0.65],
  [8, 20, 3, 15, -12, -18, 0.6],
  [-15, 22, 3.5, 19, -15, 12, 0.55],
  [12, 12, 3, 16, -5, -12, 0.6],
  [-7, 4, 3, 18, -9, 16, 0.65],
  [1, 30, 3.5, 20, -17, -16, 0.55],
  [6, 2, 3, 15, -2, -10, 0.6],
  [-12, 30, 3, 17, -13, 14, 0.5],
  [15, 24, 3.5, 19, -8, -14, 0.5],
  [-2, 16, 3, 16, -14, 18, 0.65],
];

// Broad, soft shafts of light falling from the sun through the haze: [angle (0 = up, clockwise), width] in degrees, and
// strength. Mostly downwards and to the sides, where real sunbeams show through trees.
const RAYS: [number, number, number][] = [
  [40, 7, 0.14],
  [68, 8, 0.18],
  [100, 7, 0.24],
  [128, 10, 0.3],
  [153, 6, 0.2],
  [177, 12, 0.28],
  [206, 8, 0.22],
  [238, 9, 0.16],
  [300, 8, 0.12],
];
const RAY_GRADIENT = `conic-gradient(from 0deg, ${RAYS.flatMap(([a, w, s]) => [
  `rgb(255 196 120 / 0) ${a - w}deg`,
  `rgb(255 196 120 / ${s}) ${a}deg`,
  `rgb(255 196 120 / 0) ${a + w}deg`,
]).join(", ")})`;

const at = ([x, y]: Pt): CSSProperties => ({ left: `${x}%`, top: `${y}%` });

export function HeroLight({ ratio, position = [50, 50], sun, glint, taillight }: HeroLightProps) {
  const frame = {
    "--w": `max(100cqw, 100cqh * ${ratio})`,
    "--h": `max(100cqh, 100cqw / ${ratio})`,
    width: "var(--w)",
    height: "var(--h)",
    left: `calc((100cqw - var(--w)) * ${position[0] / 100})`,
    top: `calc((100cqh - var(--h)) * ${position[1] / 100})`,
  } as CSSProperties;

  let strip: CSSProperties | undefined;
  if (taillight) {
    const [[x1, y1], [x2, y2]] = [taillight.from, taillight.to];
    // Lengths in the photo's own proportions: x is % of width, y is % of height.
    const dx = x2 - x1;
    const dy = (y2 - y1) / ratio;
    strip = {
      ...at([(x1 + x2) / 2, (y1 + y2) / 2]),
      width: `${Math.hypot(dx, dy)}%`,
      height: `${taillight.thickness}%`,
      transform: `translate(-50%, -50%) rotate(${(Math.atan2(dy, dx) * 180) / Math.PI}deg)`,
    };
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [container-type:size]">
      <div className="absolute" style={frame}>
        {/* Shafts of light: a blurred conic fan from the sun, fading with distance, drifting very slowly. */}
        <div
          className="hl-anim hl-rays absolute aspect-square w-[110%] mix-blend-screen blur-[12px]"
          style={{ ...at(sun), backgroundImage: RAY_GRADIENT, maskImage: "radial-gradient(closest-side, #000 4%, rgb(0 0 0 / 0.6) 20%, transparent 50%)" }}
        />
        {/* The sun's bloom, breathing. */}
        <div
          className="hl-anim hl-sun absolute aspect-square w-[30%] rounded-full mix-blend-screen"
          style={{
            ...at(sun),
            backgroundImage:
              "radial-gradient(circle closest-side, rgb(255 226 168 / 0.9), rgb(255 192 110 / 0.5) 20%, rgb(255 150 70 / 0.18) 45%, transparent 75%)",
          }}
        />
        {/* Dust motes drifting up through the light. */}
        {MOTES.map(([x, y, size, duration, delay, drift, opacity], i) => (
          <span
            key={i}
            className="hl-anim hl-mote absolute rounded-full mix-blend-screen"
            style={
              {
                ...at([sun[0] + x, sun[1] + y]),
                width: size,
                height: size,
                backgroundImage: "radial-gradient(circle, rgb(255 222 170), rgb(255 186 110 / 0.6) 50%, transparent 78%)",
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                "--dx": `${drift}px`,
                "--o": opacity,
              } as CSSProperties
            }
          />
        ))}
        {/* The sun's reflection shimmering on the road. */}
        {glint && (
          <div
            className="hl-anim hl-glint absolute rounded-full mix-blend-screen"
            style={{
              ...at(glint.at),
              width: `${glint.size[0]}%`,
              height: `${glint.size[1]}%`,
              backgroundImage: "radial-gradient(closest-side, rgb(255 190 110 / 0.6), rgb(255 150 70 / 0.16) 60%, transparent)",
            }}
          />
        )}
        {/* The taillight strip, glowing. */}
        {strip && <div className="hl-anim hl-tail absolute rounded-full bg-[rgb(255_50_40)] shadow-[0_0_16px_3px_rgb(255_40_30/0.5)] mix-blend-screen blur-[1.5px]" style={strip} />}
      </div>
    </div>
  );
}
