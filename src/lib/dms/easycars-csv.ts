import { parse } from "csv-parse/sync";
import { z } from "zod";
import type { Vehicle } from "../types";
import { parseDealerComment } from "./dealer-comment";

/**
 * EasyCars (Jeal) "website advertiser" CSV → normalised vehicles. Pure functions, no I/O.
 *
 * The file is a full snapshot of stock: 63 columns, UTF-8 with BOM, CRLF rows, HTML line breaks inside
 * AdvDescription. Columns used (the rest are empty or irrelevant for cars):
 *
 * | CSV column        | Vehicle field                                                                        |
 * |-------------------|--------------------------------------------------------------------------------------|
 * | StockNumber       | id, stockNumber                                                                      |
 * | Make, Model       | make, model (ALL-CAPS entries are title-cased; BMW etc. stay upper)                  |
 * | Badge, Series     | variant, series                                                                      |
 * | Year              | year                                                                                 |
 * | Price             | price (whole dollars); SpecialPrice wins when it is set and lower; blank/0 → null    |
 * | Odometer, IsMiles | odometer, odometerUnit (IsMiles is unreliable — see `inMiles`)                       |
 * | Body              | body (Saloon → Sedan; blank → "Other")                                               |
 * | GearType          | transmission ("…Dual Clutch" → "Sports Automatic DCT", CVT; blank → "Unknown")       |
 * | FuelType          | fuel ("Petrol - Premium ULP" → "Premium ULP", …; blank → "Unknown")                  |
 * | Drive             | drive (RWD / FWD / AWD / 4X4)                                                        |
 * | EngineSize, Cylinders, PowerkW | engine ("2.0L · 4-cylinder · 180 kW")                                   |
 * | DoorNum, Seats    | doors, seats                                                                         |
 * | Color, InteriorColour | colour, interior                                                                 |
 * | VIN               | vin (database only — never commit real VINs or rego to the repo)                     |
 * | AdvDescription    | description, featureGroups, features (see dealer-comment.ts)                         |
 * | StockStatus       | In_Stock / On_Offer → available. TODO(meridian): confirm whether On_Offer should show as "reserved". |
 *
 * There is no stock-in date column; `arrivedAt` is filled in by the adapter from the earliest photo date.
 */

const REQUIRED_COLUMNS = ["StockNumber", "Make", "Model", "Year", "Price", "Odometer", "AdvDescription"] as const;

const blank = (s: string) => s.trim() === "";
const number = (s: string) => {
  const n = Number(s.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
const cell = z.string().default("");
const optionalInt = cell.transform((s) => (blank(s) || !Number.isFinite(number(s)) || number(s) <= 0 ? undefined : Math.round(number(s))));
const text = cell.transform((s) => s.trim());
const required = z.string().transform((s) => s.trim()).pipe(z.string().min(1));

const Row = z.object({
  StockNumber: required,
  Make: required,
  Model: required,
  Badge: text,
  Series: text,
  Year: z.string().transform(number).pipe(z.number().int().min(1900).max(2100)),
  Price: cell,
  SpecialPrice: cell,
  Odometer: z.string().transform(number).pipe(z.number().nonnegative()),
  IsMiles: text,
  Body: text,
  GearType: text,
  FuelType: text,
  Drive: text,
  EngineSize: optionalInt,
  Cylinders: optionalInt,
  PowerkW: optionalInt,
  DoorNum: optionalInt,
  Seats: optionalInt,
  Color: text,
  InteriorColour: text,
  VIN: text,
  AdvDescription: cell,
  StockStatus: text,
});

export type EasyCarsVehicle = Omit<Vehicle, "slug" | "featured" | "arrivedAt" | "images">;
export type ParsedFeed = {
  vehicles: EasyCarsVehicle[];
  /** The raw CSV row for each vehicle id, kept for debugging mapping issues. */
  raw: Record<string, Record<string, string>>;
  totalRows: number;
  invalid: { row: number; stockNumber?: string; problem: string }[];
  duplicates: string[];
  /** Cars whose odometer was read as miles from the write-up although the feed's IsMiles says otherwise. */
  milesFromDescription: string[];
};

/** Decode the file: UTF-8 (with or without BOM), falling back to Windows-1252 when that produces bad characters. */
export function decodeCsv(bytes: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  const body = utf8.includes("�") ? new TextDecoder("windows-1252").decode(bytes) : utf8;
  return body.replace(/^﻿/, "");
}

const KEEP_UPPER = new Set(["BMW", "AMG", "HSV", "FPV", "MG", "GMC", "BYD", "LDV", "RAM", "TVR", "MINI"]);
const titleWord = (w: string) => w.charAt(0) + w.slice(1).toLowerCase();

/** "FERRARI" → "Ferrari", "LAND ROVER" → "Land Rover", "BMW" stays. Mixed-case input is left alone. */
export function tidyMake(make: string) {
  if (make !== make.toUpperCase() || KEEP_UPPER.has(make)) return make;
  return make.split(/(\s+|-)/).map((w) => (KEEP_UPPER.has(w) || !/[A-Z]/.test(w) ? w : titleWord(w))).join("");
}

/** "TESTAROSSA" → "Testarossa", "DISCOVERY 4" → "Discovery 4"; short codes (SLK, RS7, X5) stay as typed. */
export function tidyModel(model: string) {
  if (model !== model.toUpperCase()) return model;
  return model.replace(/[A-Z]{4,}/g, titleWord);
}

const BODY: Record<string, string> = { saloon: "Sedan" };
const TRANSMISSION: Record<string, string> = {
  "sports automatic dual clutch": "Sports Automatic DCT",
  "sports automatic single clutch": "Sports Automatic",
  "constantly variable transmission": "CVT",
};
const FUEL: Record<string, string> = { "petrol - premium ulp": "Premium ULP", "petrol - unleaded ulp": "ULP" };
const drive = (value: string) => {
  const v = value.toLowerCase();
  if (!v) return undefined;
  if (v.startsWith("rear")) return "RWD";
  if (v.startsWith("front")) return "FWD";
  if (v.startsWith("4x4")) return "4X4";
  if (v.startsWith("four") || v.startsWith("all")) return "AWD";
  return value;
};
/** "RED" → "Red", "black" → "Black"; mixed-case names ("Sepang Bronze Metallic") are left alone. */
const capitalise = (s: string) => {
  if (!s) return s;
  const t = s === s.toUpperCase() ? s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : s;
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const lookup = (table: Record<string, string>, value: string, fallback: string) => (value ? (table[value.toLowerCase()] ?? value) : fallback);

/**
 * EasyCars' IsMiles flag is not maintained (the 1989 Testarossa is "False" with 12,800 on the clock, in miles).
 * Trust the flag when set; otherwise treat the reading as miles only if the write-up quotes that exact figure in miles.
 */
function inMiles(isMiles: string, odometer: number, description: string) {
  if (/^(true|1|yes)$/i.test(isMiles)) return { miles: true, guessed: false };
  const figure = new Intl.NumberFormat("en-AU").format(odometer);
  const quoted = new RegExp(`\\b(${figure}|${odometer})\\s*(miles|mi)\\b`, "i").test(description);
  return { miles: quoted, guessed: quoted };
}

function price(listed: string, special: string): number | null {
  const candidates = [listed, special].map(number).filter((n) => Number.isFinite(n) && n > 0);
  return candidates.length ? Math.round(Math.min(...candidates)) : null;
}

function engine(cc?: number, cylinders?: number, kw?: number) {
  const parts = [cc ? `${(cc > 50 ? cc / 1000 : cc).toFixed(1)}L` : null, cylinders ? `${cylinders}-cylinder` : null, kw ? `${kw} kW` : null];
  return parts.filter(Boolean).join(" · ") || undefined;
}

export function parseEasyCarsCsv(csv: string): ParsedFeed {
  const records: Record<string, string>[] = parse(csv, { columns: true, bom: true, skip_empty_lines: true, relax_column_count: false });
  const header = records.length ? Object.keys(records[0]) : [];
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (records.length === 0) throw new Error("EasyCars CSV has no rows");
  if (missing.length) throw new Error(`EasyCars CSV is missing expected columns: ${missing.join(", ")}`);

  const byId = new Map<string, EasyCarsVehicle>();
  const raw: ParsedFeed["raw"] = {};
  const invalid: ParsedFeed["invalid"] = [];
  const duplicates: string[] = [];
  const milesFromDescription: string[] = [];

  records.forEach((record, i) => {
    const parsed = Row.safeParse(record);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      invalid.push({ row: i + 2, stockNumber: record.StockNumber?.trim() || undefined, problem: `${issue.path.join(".")}: ${issue.message}` });
      return;
    }
    const r = parsed.data;
    const comment = parseDealerComment(r.AdvDescription);
    const unit = inMiles(r.IsMiles, r.Odometer, comment.description);
    if (unit.guessed) milesFromDescription.push(r.StockNumber);
    if (byId.has(r.StockNumber)) duplicates.push(r.StockNumber);

    // Later rows win, so a duplicated stock number keeps its last entry.
    byId.set(r.StockNumber, {
      id: r.StockNumber,
      stockNumber: r.StockNumber,
      status: "available",
      year: r.Year,
      make: tidyMake(r.Make),
      model: tidyModel(r.Model),
      variant: r.Badge || undefined,
      series: r.Series || undefined,
      price: price(r.Price, r.SpecialPrice),
      odometer: Math.round(r.Odometer),
      odometerUnit: unit.miles ? "mi" : "km",
      body: lookup(BODY, r.Body, "Other"),
      transmission: lookup(TRANSMISSION, r.GearType, "Unknown"),
      fuel: lookup(FUEL, r.FuelType, "Unknown"),
      drive: drive(r.Drive),
      engine: engine(r.EngineSize, r.Cylinders, r.PowerkW),
      doors: r.DoorNum,
      seats: r.Seats,
      colour: capitalise(r.Color) || undefined,
      interior: capitalise(r.InteriorColour) || undefined,
      vin: r.VIN || undefined,
      description: comment.description,
      features: comment.features,
      featureGroups: comment.featureGroups,
    });
    raw[r.StockNumber] = record;
  });

  // One bad row should not sink the feed, but a feed that is mostly bad is not one to publish.
  if (invalid.length > records.length * 0.2) {
    throw new Error(`EasyCars CSV rejected: ${invalid.length} of ${records.length} rows are invalid (first: row ${invalid[0].row}, ${invalid[0].problem})`);
  }
  return { vehicles: [...byId.values()], raw, totalRows: records.length, invalid, duplicates, milesFromDescription };
}
