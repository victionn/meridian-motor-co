import type { Vehicle } from "../types";

/**
 * A DMS (dealer management system) adapter turns the dealer's stock feed
 * into normalised vehicles. Write one per provider; the sync job doesn't
 * care which is in use.
 */
export interface DmsAdapter {
  readonly name: string;
  /**
   * True when photos are copied into our own storage by a separate step (see easycars-sync.ts). The stock upsert
   * then leaves each car's stored photos alone instead of replacing them with the feed's (empty) list.
   */
  readonly keepsStoredImages?: boolean;
  fetchStock(): Promise<Omit<Vehicle, "slug" | "featured">[]>;
}
