import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png", "og-image.png"],
      manifest: {
        name: "Lumio",
        short_name: "Lumio",
        description: "Ton compagnon de bien-être mental au quotidien",
        start_url: "/home",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0f0f23",
        theme_color: "#7C3AED",
        lang: "fr",
        icons: [
          { src: "/favicon.svg",  type: "image/svg+xml", sizes: "any",     purpose: "any maskable" },
          { src: "/icon-192.png", type: "image/png",     sizes: "192x192", purpose: "any" },
          { src: "/icon-512.png", type: "image/png",     sizes: "512x512", purpose: "any maskable" },
        ],
      },
      workbox: {
        // App shell + vendor chunks: cache-first (they change only on deploy)
        globPatterns: ["**/*.{js,css,html,ico,svg,png,woff2}"],
        runtimeCaching: [
          {
            // Supabase API — network-first, fall back to cache (user data must be fresh)
            urlPattern: ({ url }) => url.hostname.includes("supabase.co"),
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Google Fonts stylesheets — stale-while-revalidate (CSS may update)
            urlPattern: ({ url }) => url.hostname.includes("fonts.googleapis.com"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts files — cache-first; status:0 allows opaque cross-origin responses
            urlPattern: ({ url }) => url.hostname.includes("fonts.gstatic.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-vendor')) return 'vendor-charts';
          if (id.includes('node_modules/firebase')) return 'vendor-firebase';
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router') || id.includes('node_modules/scheduler')) return 'vendor-react';
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide';
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    passWithNoTests: true,
  },
});
