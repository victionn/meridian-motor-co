import type { ReactNode } from "react";
import type { PopularFeature, PopularFeatureId } from "@/lib/popular-features";

/**
 * Fine-line pictograms drawn for this site (32×32 grid, 1.3 stroke) so the feature tiles match the spec icons on
 * the cards rather than borrowing colourful stock illustrations.
 */
const ICONS: Record<PopularFeatureId, ReactNode> = {
  engine: (
    <>
      <path d="M9 12h11l3 3h3v8h-3l-2 2H11l-2-2H6v-6h3z" />
      <path d="M12 12V8.5h6V12M10 8.5h10M3.5 15.5v7M6 19H3.5M26 17.5h2.5v3H26" />
    </>
  ),
  manual: (
    <>
      <path d="M8 9v14M16 9v14M24 9v7H8" />
      <circle cx="8" cy="7" r="2" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="24" cy="7" r="2" />
      <circle cx="8" cy="25" r="2" />
      <circle cx="16" cy="25" r="2" />
    </>
  ),
  convertible: (
    <>
      <path d="M3 21v-3.5l4-1.5 9-1 3-4h3M22 11l-1.5 4 7.5 2.5V21h-2.5M10 21h10M3 21h1.5" />
      <circle cx="7.5" cy="21.5" r="2.5" />
      <circle cx="23" cy="21.5" r="2.5" />
    </>
  ),
  sunroof: (
    <>
      <rect x="5" y="9" width="22" height="14" rx="3" />
      <rect x="9" y="12.5" width="14" height="7" rx="1.5" />
      <path d="M16 3v3M9 4.5l1.5 2.5M23 4.5 21.5 7" />
    </>
  ),
  carplay: (
    <>
      <rect x="4" y="7" width="24" height="16" rx="2.5" />
      <rect x="8" y="10.5" width="4" height="4" rx="1" />
      <rect x="14" y="10.5" width="4" height="4" rx="1" />
      <rect x="20" y="10.5" width="4" height="4" rx="1" />
      <rect x="8" y="16" width="4" height="4" rx="1" />
      <rect x="14" y="16" width="4" height="4" rx="1" />
      <rect x="20" y="16" width="4" height="4" rx="1" />
      <path d="M12 26.5h8" />
    </>
  ),
  camera360: (
    <>
      <rect x="12" y="8" width="8" height="16" rx="3" />
      <path d="M12 13h8M12 19.5h8" />
      <path d="M7 7.5a12.5 12.5 0 0 0 0 17M25 7.5a12.5 12.5 0 0 1 0 17" />
      <path d="M11 4.5a12 12 0 0 1 10 0M11 27.5a12 12 0 0 0 10 0" />
    </>
  ),
  camera: (
    <>
      <rect x="4" y="7" width="24" height="16" rx="2.5" />
      <path d="M11 20l2.5-9M21 20l-2.5-9M12 16.5h8M12.8 13.5h6.4" />
      <path d="M12 26.5h8" />
    </>
  ),
  sensors: (
    <>
      <path d="M4 12h11l3 3v6H4" />
      <path d="M4 16.5h14" />
      <circle cx="9" cy="21.5" r="2.3" />
      <path d="M21.5 14a5 5 0 0 1 0 7M24.5 11.5a9 9 0 0 1 0 12M27.5 9a13 13 0 0 1 0 17" />
    </>
  ),
  keyless: (
    <>
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="7" />
      <path d="M16 11v5M12.8 13.2a4.5 4.5 0 1 0 6.4 0" />
    </>
  ),
  adaptiveCruise: (
    <>
      <path d="M5 23a11.5 11.5 0 1 1 22 0" />
      <path d="M16 20l5-7" />
      <circle cx="16" cy="20.5" r="1.6" />
      <path d="M8 26.5h16M16 8.5v2M8 13l1.5 1M24 13l-1.5 1" />
    </>
  ),
  heatedSeats: (
    <>
      <path d="M11 6c-1 3-1.5 8 0 13h9M11 19l-2 5.5h13.5L21 19" />
      <path d="M11 6h3.5c1 4 1 8 0 13" />
      <path d="M21 5c-1.5 2 1.5 3 0 5M25 5c-1.5 2 1.5 3 0 5M23 11.5c-1.5 2 1.5 3 0 5" />
    </>
  ),
  leather: (
    <>
      <path d="M10 5.5h8c1.5 5 1.5 10 0 14h-8c-1.5-4-1.5-9 0-14z" />
      <path d="M9 19.5 7 26h18l-2-6.5M12 9h4M12 12.5h4M12 16h4" />
    </>
  ),
  navigation: (
    <>
      <circle cx="16" cy="16" r="11.5" />
      <path d="M20.5 11.5 18 18l-6.5 2.5L14 14z" />
      <path d="M16 4.5v2M16 25.5v2M4.5 16h2M25.5 16h2" />
    </>
  ),
  audio: (
    <>
      <rect x="8" y="4" width="16" height="24" rx="2.5" />
      <circle cx="16" cy="18.5" r="5" />
      <circle cx="16" cy="18.5" r="1.5" />
      <circle cx="16" cy="9" r="1.8" />
    </>
  ),
  blindSpot: (
    <>
      <path d="M6 10h13.5c2 0 3.5 1.5 3.5 3.5v5c0 2-1.5 3.5-3.5 3.5H9.5z" />
      <path d="M6 10l3.5 12M23 16h3.5M14.5 13l-3.2 5.5h6.4z" />
    </>
  ),
  wirelessCharging: (
    <>
      <rect x="10" y="4" width="12" height="20" rx="2.5" />
      <path d="M16.8 9.5 14 14.5h4l-2.8 5" />
      <path d="M6 27.5h20" />
    </>
  ),
  climate: (
    <>
      <path d="M16 4v24M5.6 10l20.8 12M26.4 10 5.6 22" />
      <path d="M13 5.5l3 2.5 3-2.5M13 26.5l3-2.5 3 2.5M4.8 14l3.7-1.3-.7-3.9M27.2 18l-3.7 1.3.7 3.9M27.2 14l-3.7-1.3.7-3.9M4.8 18l3.7 1.3-.7 3.9" />
    </>
  ),
  cruise: (
    <>
      <path d="M5 23a11.5 11.5 0 1 1 22 0" />
      <path d="M16 20l-5-6" />
      <circle cx="16" cy="20.5" r="1.6" />
      <path d="M8 26.5h16" />
    </>
  ),
  led: (
    <>
      <path d="M14 8c-5 0-8 3.5-8 8s3 8 8 8c1.5 0 2-1 2-2.5v-11C16 9 15.5 8 14 8z" />
      <path d="M20 10h6.5M20 14h6.5M20 18h6.5M20 22h6.5M10 12.5v7" />
    </>
  ),
  alloys: (
    <>
      <circle cx="16" cy="16" r="12" />
      <circle cx="16" cy="16" r="8.5" />
      <circle cx="16" cy="16" r="2" />
      <path d="M16 7.5V14M16 18v6.5M8 13.4l6.2 2M17.9 16.6l6.1 2M11 22.9l3.8-5.3M17.2 14.4l3.8-5.3M21 22.9l-3.8-5.3M14.8 14.4 11 9.1" />
    </>
  ),
  awd: (
    <>
      <path d="M9 8v16M23 8v16M9 16h14M16 8v16" />
      <rect x="5.5" y="5" width="7" height="6" rx="1.5" />
      <rect x="19.5" y="5" width="7" height="6" rx="1.5" />
      <rect x="5.5" y="21" width="7" height="6" rx="1.5" />
      <rect x="19.5" y="21" width="7" height="6" rx="1.5" />
    </>
  ),
  bluetooth: <path d="M10 10.5l12 11-6 5.5V5l6 5.5-12 11" />,
  windows: (
    <>
      <path d="M5 26V15L13 6h13v20z" />
      <path d="M9 15l5.5-6H23v6z" />
      <path d="M13 20.5l3 3 3-3M16 23.5v-5" />
    </>
  ),
  matchingNumbers: (
    <>
      <rect x="4" y="9" width="24" height="14" rx="2.5" />
      <path d="M12 12.5l-1.5 7M17 12.5l-1.5 7M9 14.5h9.5M8.5 17.5H18" />
      <path d="M21.5 16.5l1.5 1.5 2.5-3" />
    </>
  ),
  australianDelivered: (
    <>
      <path d="M16 28s-8.5-7.3-8.5-14a8.5 8.5 0 0 1 17 0c0 6.7-8.5 14-8.5 14z" />
      <path d="M16 9.5l1.3 2.7 2.9.4-2.1 2.1.5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2.1 2.9-.4z" />
    </>
  ),
  oneOwner: (
    <>
      <circle cx="16" cy="11" r="5" />
      <path d="M6 27c0-5.5 4.5-9 10-9s10 3.5 10 9" />
    </>
  ),
  serviceHistory: (
    <>
      <path d="M16 8c-3-2-7-2-11-1v17c4-1 8-1 11 1 3-2 7-2 11-1V7c-4-1-8-1-11 1z" />
      <path d="M16 8v17M8.5 12h4M8.5 16h4M19.5 12h4M19.5 16h4" />
    </>
  ),
};

/** Side-scrolling row of feature tiles: a pictogram on a pale grey tile with the feature name beneath. */
export function PopularFeatures({ features }: { features: PopularFeature[] }) {
  if (!features.length) return null;
  return (
    <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {features.map((f) => (
        <li key={f.id} className="w-44 shrink-0 snap-start sm:w-52">
          <div className="flex aspect-4/3 items-center justify-center rounded-2xl bg-ink/5">
            <svg aria-hidden viewBox="0 0 32 32" className="h-16 w-16 text-ink sm:h-[4.5rem] sm:w-[4.5rem]" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[f.id]}
            </svg>
          </div>
          <p className="mt-3 text-lg font-semibold leading-snug tracking-tight">{f.label}</p>
        </li>
      ))}
    </ul>
  );
}
