import type { Vehicle } from "./types";

export type PopularFeatureId =
  | "engine" | "manual" | "convertible" | "sunroof" | "carplay" | "camera360" | "camera" | "sensors" | "keyless"
  | "adaptiveCruise" | "heatedSeats" | "leather" | "navigation" | "audio" | "blindSpot" | "wirelessCharging"
  | "climate" | "cruise" | "led" | "alloys" | "awd" | "bluetooth" | "windows" | "matchingNumbers"
  | "australianDelivered" | "oneOwner" | "serviceHistory";

export type PopularFeature = { id: PopularFeatureId; label: string };

type Rule = { id: PopularFeatureId; label: string | ((v: Vehicle, text: string) => string); test: RegExp | ((v: Vehicle) => boolean) };

const cylinders = (v: Vehicle) => Number(v.engine?.match(/(\d+)-cylinder/)?.[1] ?? 0);

/**
 * The headline features buyers look for, in display order: what makes the car special first (engine, gearbox,
 * roof, provenance), then comfort and technology. A rule matches on the car's specs or on the wording of its
 * feature list and write-up, so it keeps working for new stock without anyone tagging cars by hand.
 */
const RULES: Rule[] = [
  { id: "engine", label: (v) => `${cylinders(v)}-cylinder engine`, test: (v) => cylinders(v) >= 8 },
  { id: "manual", label: "Manual gearbox", test: (v) => /manual/i.test(v.transmission) },
  { id: "convertible", label: "Convertible", test: (v) => /convertible|roadster|cabriolet/i.test(v.body) },
  { id: "matchingNumbers", label: "Matching numbers", test: /matching[- ]numbers/i },
  { id: "australianDelivered", label: "Australian delivered", test: /australian[- ]delivered/i },
  { id: "oneOwner", label: "One owner", test: /\b(one|single)[- ]owner\b/i },
  { id: "sunroof", label: (_, t) => (/panoramic/i.test(t) ? "Panoramic sunroof" : "Sunroof"), test: /sunroof|panoramic (glass )?roof|glass roof/i },
  { id: "carplay", label: "Apple CarPlay & Android Auto", test: /carplay|android auto/i },
  { id: "camera360", label: "360° camera", test: /360[- °]*(degree)?[- ]*camera|surround[- ]view/i },
  { id: "camera", label: "Reversing camera", test: /revers(e|ing) camera|rear[- ]?view camera|parking camera/i },
  { id: "sensors", label: "Parking sensors", test: /parking sensors|park(ing)? distance control|parktronic/i },
  { id: "keyless", label: "Keyless entry & start", test: /keyless|push[- ]button start|push start|comfort access/i },
  { id: "adaptiveCruise", label: "Adaptive cruise control", test: /adaptive cruise|distronic|radar cruise/i },
  { id: "heatedSeats", label: "Heated seats", test: /heated (and ventilated )?(front |rear )?seats|seat heating/i },
  { id: "leather", label: "Leather interior", test: /leather/i },
  { id: "navigation", label: "Satellite navigation", test: /satellite navigation|sat[- ]?nav|navigation system|\bgps\b/i },
  { id: "audio", label: "Premium audio", test: /burmester|bose|harman|bang ?& ?olufsen|premium (audio|sound)|sound system/i },
  { id: "blindSpot", label: "Blind spot monitoring", test: /blind[- ]spot/i },
  { id: "wirelessCharging", label: "Wireless charging", test: /wireless (phone )?charging/i },
  { id: "climate", label: (_, t) => (/climate control/i.test(t) ? "Climate control" : "Air conditioning"), test: /climate control|air[- ]conditioning/i },
  { id: "cruise", label: "Cruise control", test: /cruise control/i },
  { id: "led", label: "LED lighting", test: /\bLED\b.*(light|lamp)|led lighting/i },
  { id: "alloys", label: "Alloy wheels", test: /alloy wheels|\d{2}[- ]inch[^.]*(alloy|wheels)/i },
  { id: "awd", label: "All-wheel drive", test: (v) => /awd|4x4|4wd|all[- ]wheel/i.test(v.drive ?? "") },
  { id: "bluetooth", label: "Bluetooth", test: /bluetooth/i },
  { id: "windows", label: "Electric windows", test: /(electric|power) windows/i },
  { id: "serviceHistory", label: "Service history", test: /service history|full (mb|bmw|porsche|ferrari)? ?history|log ?books/i },
];

export function getPopularFeatures(v: Vehicle, limit = 8): PopularFeature[] {
  const text = [...v.features, v.description].join("\n");
  const found: PopularFeature[] = [];
  for (const rule of RULES) {
    if (!(typeof rule.test === "function" ? rule.test(v) : rule.test.test(text))) continue;
    // Adaptive cruise already says "cruise control"; don't list both.
    if (rule.id === "cruise" && found.some((f) => f.id === "adaptiveCruise")) continue;
    found.push({ id: rule.id, label: typeof rule.label === "function" ? rule.label(v, text) : rule.label });
    if (found.length === limit) break;
  }
  return found;
}
