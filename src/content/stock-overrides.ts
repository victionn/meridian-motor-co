import type { Vehicle } from "@/lib/types";

/**
 * Editorial corrections applied on top of the stock feed, keyed by stock number. Use this when EasyCars has a
 * field blank or wrong and it matters on the site; the proper fix is still to correct the record in EasyCars,
 * after which the entry here can be deleted. Feed values are only replaced for the fields listed.
 */
export const stockOverrides: Record<string, Partial<Pick<Vehicle, "body" | "transmission" | "fuel" | "drive" | "engine" | "variant" | "odometerUnit" | "status">>> = {
  // 1989 Ferrari Testarossa: the EasyCars record has body, gearbox, fuel and drive blank.
  "13171": { body: "Coupe", transmission: "Manual", fuel: "Premium ULP", drive: "RWD" },
};
