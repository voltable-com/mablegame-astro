import { defineConfig } from 'astro/config';

// https://astro.build/config
import mdx from "@astrojs/mdx";
import compress from "astro-compress";
import AstroPWA from '@vite-pwa/astro';
import { seoconfig } from "./utils/seoconfig";

// https://astro.build/config
export default defineConfig({
  site: seoconfig.baseURL,
  build: {
    assets: "assets"
  },
  vite: {
    logLevel: 'info',
    define: {
      __DATE__: `'${new Date().toISOString()}'`
    }
  },
  integrations: [mdx(), compress(), AstroPWA({
    mode: 'development',
    base: '/',
    scope: '/',
    includeAssets: ['favicon.svg'],
    manifest: {
      name: 'Mable game by Voltable.com - guess the multiplication',
      short_name: 'Mable Game by Voltable.com',
      theme_color: '#ffffff',
      start_url: '/',
      icons: [{
        src: 'favicon-192.png',
        sizes: '192x192',
        type: 'image/png'
      }, {
        src: 'favicon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }, {
        src: 'favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }]
    },
    workbox: {
      globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}']
    },
    devOptions: {
      enabled: true,
      navigateFallback: '/404'
    }
  })]
});