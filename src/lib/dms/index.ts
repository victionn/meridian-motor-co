import "server-only";
import type { DmsAdapter } from "./adapter";
import { EasyCarsFtpAdapter } from "./easycars-ftp";
import { GenericJsonFeedAdapter } from "./generic-json-feed";

export type DmsProvider = "easycars-ftp" | "generic-json";

export function getDmsProvider(env: NodeJS.ProcessEnv = process.env): DmsProvider {
  const provider = env.DMS_PROVIDER ?? "generic-json";
  if (provider !== "easycars-ftp" && provider !== "generic-json") throw new Error(`Unknown DMS_PROVIDER "${provider}"`);
  return provider;
}

export function getDmsAdapter(provider: DmsProvider = getDmsProvider()): DmsAdapter {
  return provider === "easycars-ftp" ? new EasyCarsFtpAdapter() : new GenericJsonFeedAdapter();
}
