import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { getDmsAdapter, getDmsProvider } from "@/lib/dms";
import { easyCarsPaths } from "@/lib/dms/easycars-ftp";
import { runEasyCarsSync } from "@/lib/dms/easycars-sync";
import { getImageStore } from "@/lib/dms/image-stores";
import { syncInventory } from "@/lib/dms/sync";
import { FtpTransport, ftpConfigFromEnv, TransportError } from "@/lib/dms/transport";
import { INVENTORY_TAG } from "@/lib/inventory";

/** Photo copying is sequential over one FTP connection; give it room (the per-run cap keeps it well inside this). */
export const maxDuration = 300;

/**
 * Pulls stock from the DMS into Postgres and refreshes cached pages.
 * Called by a scheduler (Vercel Cron sends GET with `Authorization: Bearer $CRON_SECRET`).
 * `?dryRun=1` returns the parsed vehicles and the photo work that would be done, without writing anything.
 */
export async function GET(request: NextRequest) {
  const auth = (await headers()).get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (process.env.INVENTORY_SOURCE !== "postgres") {
    return Response.json({ error: "INVENTORY_SOURCE must be 'postgres' to sync" }, { status: 400 });
  }
  const dryRun = ["1", "true"].includes(request.nextUrl.searchParams.get("dryRun") ?? "");

  try {
    const provider = getDmsProvider();
    if (provider !== "easycars-ftp") {
      if (dryRun) return Response.json({ ok: true, dryRun, vehicles: await getDmsAdapter(provider).fetchStock() });
      const report = await syncInventory(getDmsAdapter(provider));
      revalidateTag(INVENTORY_TAG, "max");
      return Response.json({ ok: true, ...report });
    }

    const transport = new FtpTransport(ftpConfigFromEnv());
    try {
      // A dry run writes no photos, so it must not need storage credentials.
      const store = dryRun ? { put: async () => Promise.reject(new Error("dry run")) } : getImageStore();
      const report = await runEasyCarsSync(getDb(), transport, store, { ...easyCarsPaths(), dryRun });
      if (!dryRun && (!report.csvUnchanged || report.imagesUploaded > 0)) revalidateTag(INVENTORY_TAG, "max");
      return Response.json({ ok: true, ...report });
    } finally {
      transport.close();
    }
  } catch (err) {
    // Messages are already scrubbed of credentials by the transport; stock is untouched on any failure before the write.
    console.error("[sync] failed:", (err as Error).message);
    const upstream = err instanceof TransportError;
    return Response.json({ ok: false, error: (err as Error).message }, { status: upstream ? 502 : 500 });
  }
}
