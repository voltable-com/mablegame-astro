import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { generateSW } from "workbox-build";

export default function serviceWorker(): AstroIntegration {
  return {
    name: "service-worker",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const { count, size, warnings } = await generateSW({
          globDirectory: outDir,
          globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff2,webmanifest}"],
          swDest: join(outDir, "sw.js"),
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          sourcemap: false,
        });
        warnings.forEach((warning) => logger.warn(warning));
        logger.info(`sw.js precaches ${count} files (${(size / 1024).toFixed(1)} KiB)`);
      },
    },
  };
}
