import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/MyWorld/",

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Nimarchik & Monorochka",
        short_name: "N&M",

        description:
          "Наш маленький мир ❤️",

        start_url: "/MyWorld/",
        scope: "/MyWorld/",

        display: "standalone",

        theme_color: "#171129",
        background_color: "#171129",

        icons: [
          {
            src: "/MyWorld/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/MyWorld/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});