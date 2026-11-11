import "server-only";
import { stockOverrides } from "@/content/stock-overrides";
import type { DmsAdapter } from "./adapter";
import { earliestPhotoDate, groupImages } from "./easycars-images";
import { readFeed } from "./easycars-sync";
import { FtpTransport, ftpConfigFromEnv } from "./transport";

export const easyCarsPaths = (env: NodeJS.ProcessEnv = process.env) => ({
  csvPath: env.EASYCARS_CSV_PATH ?? "meridianwholesale.csv",
  imagesDir: env.EASYCARS_IMAGES_DIR ?? "images",
});

/**
 * EasyCars has no API: it pushes a CSV snapshot and photos to an FTP server. This adapter reads the CSV side of
 * that (stock only); photos are copied into permanent storage by `runEasyCarsSync`, which the cron route uses.
 */
export class EasyCarsFtpAdapter implements DmsAdapter {
  readonly name = "easycars-ftp";
  readonly keepsStoredImages = true;

  async fetchStock() {
    const transport = new FtpTransport(ftpConfigFromEnv());
    const { csvPath, imagesDir } = easyCarsPaths();
    try {
      const { feed } = await readFeed(transport, csvPath, 20_000);
      const photos = groupImages(await transport.list(imagesDir));
      const now = new Date();
      return feed.vehicles.map((v) => ({ ...v, ...stockOverrides[v.id], arrivedAt: (earliestPhotoDate(photos.get(v.id), now) ?? now).toISOString(), images: [] }));
    } finally {
      transport.close();
    }
  }
}
