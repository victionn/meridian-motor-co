/**
 * First import: the same sync the cron runs, but with no cap on photo downloads (the ~77 cars in stock carry a
 * couple of thousand photos between them). Safe to re-run — it resumes where it stopped.
 *
 *   npm run stock:backfill            # write to Postgres + photo storage
 *   npm run stock:backfill -- --dry   # parse and report only
 *
 * Needs DATABASE_URL, the EASYCARS_FTP_* settings and either BLOB_READ_WRITE_TOKEN or IMAGE_STORE=local in .env.local.
 */
import { getDb } from "@/db/client";
import { easyCarsPaths } from "@/lib/dms/easycars-ftp";
import { runEasyCarsSync } from "@/lib/dms/easycars-sync";
import { getImageStore } from "@/lib/dms/image-stores";
import { FtpTransport, ftpConfigFromEnv } from "@/lib/dms/transport";

async function main() {
  const dryRun = process.argv.includes("--dry");
  const transport = new FtpTransport({ ...ftpConfigFromEnv(), timeoutMs: 60_000 });
  try {
    const store = dryRun ? { put: async () => Promise.reject(new Error("dry run")) } : getImageStore();
    const report = await runEasyCarsSync(getDb(), transport, store, { ...easyCarsPaths(), maxImages: Infinity, dryRun });
    const { vehicles, ...summary } = report;
    console.log(JSON.stringify(summary, null, 2));
    if (vehicles) console.log(`${vehicles.length} vehicles parsed, e.g.`, vehicles.slice(0, 2).map((v) => `${v.year} ${v.make} ${v.model} $${v.price}`));
  } catch (err) {
    console.error("Backfill failed:", (err as Error).message);
    process.exitCode = 1;
  } finally {
    transport.close();
  }
}

// Wrapped in a function because tsx runs this file as CommonJS, which has no top-level await.
main().finally(() => process.exit());
