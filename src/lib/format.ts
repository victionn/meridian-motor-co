import type { Vehicle } from "./types";

const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("en-AU");

export const formatPrice = (price: number | null) =>
  price && price > 0 ? aud.format(price) : "Price on application";

export const formatCurrency = (n: number) => aud.format(Math.round(n));

/** Odometer reading in whole kilometres; cars recorded in miles are converted. */
export const odometerKm = (v: Pick<Vehicle, "odometer" | "odometerUnit">) =>
  Math.round(v.odometerUnit === "mi" ? v.odometer * 1.609344 : v.odometer);

/** Always shown in km, whatever unit the car was recorded in. */
export const formatOdometer = (v: Pick<Vehicle, "odometer" | "odometerUnit">) => `${num.format(odometerKm(v))} km`;

export const vehicleTitle = (v: Pick<Vehicle, "year" | "make" | "model" | "variant">) =>
  [v.year, v.make, v.model, v.variant].filter(Boolean).join(" ");

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Canonical vehicle slug: 2015-mercedes-benz-c63-amg-edition-507-13148 */
export const buildVehicleSlug = (
  v: Pick<Vehicle, "year" | "make" | "model" | "variant" | "stockNumber">,
) => slugify([v.year, v.make, v.model, v.variant, v.stockNumber].filter(Boolean).join(" "));
