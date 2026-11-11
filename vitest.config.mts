import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside a React Server environment; tests run the same modules under plain Node.
      "server-only": fileURLToPath(new URL("./src/lib/dms/__tests__/server-only-stub.ts", import.meta.url)),
    },
  },
  test: { include: ["src/**/*.test.ts"], testTimeout: 30_000 },
});
