import { defineConfig, fontProviders } from "astro/config";
import serviceWorker from "./src/integrations/service-worker";
import { seoconfig } from "./src/utils/seoconfig";

// https://astro.build/config
export default defineConfig({
  site: seoconfig.baseURL,
  base: "/games/mable/",
  build: {
    assets: "assets",
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Fredoka",
      cssVariable: "--font-display",
      weights: ["300 700"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-rounded", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Nunito",
      cssVariable: "--font-body",
      weights: ["200 1000"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: ["100 800"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
  vite: {
    logLevel: "info",
    define: {
      __DATE__: `'${new Date().toISOString()}'`,
    },
  },
  integrations: [serviceWorker()],
});
