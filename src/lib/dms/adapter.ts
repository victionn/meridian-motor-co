import type { Vehicle } from "../types";

/**
 * A DMS (dealer management system) adapter turns the dealer's stock feed
 * into normalised vehicles. Write one per provider; the sync job doesn't
 * care which is in use.
 */
export interface DmsAdapter {
  readonly name: string;
  fetchStock(): Promise<Omit<Vehicle, "slug" | "featured">[]>;
}
