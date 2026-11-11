/**
 * Dealers type the "dealer comment" free-hand: a few paragraphs of prose, then feature lists under headings
 * ("FACTORY OPTIONS", "Features include:") written as dash, bullet or numbered lines, then showroom boilerplate.
 * This turns that text into the write-up shown under "About this car" and the grouped features beneath it.
 * Rule-based on purpose: it is free, instant and predictable; prose with no lists simply yields no feature groups.
 */
export type FeatureGroup = { title: string; items: string[] };

/** Generic showroom lines that say nothing about the car itself. */
const BOILERPLATE =
  /Meridian Motor Co is home|Interstate buyers welcome|Contact our sales team|Established in 2012|Now located on Sydney|Enquire today|Inspection strictly|Visit our indoor showroom|Located Lane Cove|Visit our landmark showroom|Whether it be the iconic|air-conditioned customer area|Servicing packages are available|Tailored finance|Inspection and test drive highly/i;
/** Headings that introduce dealer boilerplate; everything from one of these onward is dropped. */
const CLOSING_HEADING = /BUY WITH CONFIDENCE|WHY BUY|ABOUT (US|MERIDIAN)/i;
const ITEM = /^(?:[–\-•*]|\d+[.)])\s*/;
const KEEP_UPPER = /\b(Gti|Gts|Amg|Led|Bmw|Dsg|Suv|Awd|Rwd|V8|V12|S54|Hse|Svr|Rs|Tfsi|Tdi)\b/g;

const isItem = (line: string) => ITEM.test(line) && line.replace(ITEM, "").length > 0;

function isHeading(line: string) {
  if (isItem(line) || line.length >= 70) return false;
  const shouting = line.toUpperCase() === line && /[A-Z]{3}/.test(line) && !line.startsWith("*");
  return shouting || /[:;]$/.test(line);
}

function headingTitle(line: string) {
  const text = line.replace(/[:;]+$/, "").trim();
  if (text.toUpperCase() !== text) return text.replace(/\s+include$/i, "").replace(/^Features include$/i, "Features");
  const title = text.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  return title
    .replace(/\b(And|Of|For|The|With|In|A)\b/g, (w, _1, at: number) => (at === 0 ? w : w.toLowerCase()))
    .replace(KEEP_UPPER, (w) => w.toUpperCase());
}

/** Convert the feed's HTML-ish text (`<br />`, entities) into plain lines. */
export function plainLines(text: string): string[] {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function parseDealerComment(text: string): { description: string; featureGroups: FeatureGroup[]; features: string[] } {
  const paragraphs: string[] = [];
  const groups: FeatureGroup[] = [];
  let current: FeatureGroup | null = null;

  for (const line of plainLines(text)) {
    if (isHeading(line)) {
      if (CLOSING_HEADING.test(line)) break;
      current = { title: headingTitle(line) || "Features", items: [] };
      groups.push(current);
    } else if (current && (isItem(line) || (line.length < 60 && !line.endsWith(".")))) {
      current.items.push(line.replace(ITEM, ""));
    } else {
      // A sentence ends a list; one straight after a heading only introduces it.
      if (current && current.items.length > 0) current = null;
      if (!BOILERPLATE.test(line) && !isItem(line)) paragraphs.push(line.replace(/^[*\s]+|[*\s]+$/g, ""));
    }
  }

  const featureGroups = groups.filter((g) => g.items.length > 0);
  return { description: paragraphs.filter(Boolean).join("\n\n"), featureGroups, features: featureGroups.flatMap((g) => g.items) };
}
