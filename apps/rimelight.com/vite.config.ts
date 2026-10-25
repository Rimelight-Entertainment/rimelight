import { defineConfig } from "vite-plus";
import { cloudflare } from "@cloudflare/vite-plugin";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { seo } from "@rimelight/seo/plugin";
import { security } from "@rimelight/security/plugin";
import { auth } from "@rimelight/auth/plugin";
import { i18n } from "@rimelight/i18n/plugin";
import { ui } from "@rimelight/ui/plugin";
import { cms } from "@rimelight/cms/plugin";
import { uiDocsMeta } from "./src/docs/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare(),

    solid({
      exclude: ["src/fetch.ts"],
      start: true,
      ssr: true,
      serverFunctions: true,
    }),

    fileRoutes({ types: ".cloudflare/types/file-routes.d.ts" }),

    seo({
      id: "rimelight.com",
      url: "https://rimelight.com",
      name: "Rimelight",
      description: "Welcome to my website!",
      author: "Rimelight",
      branding: {
        logo: { alt: "Rimelight" },
        favicon: { svg: "https://cdn.rimelight.com/logos/logomark_color.svg" },
        appleTouchIcon: "https://cdn.rimelight.com/logos/logomark_color.svg",
        colors: { themeColor: "#ffffff", backgroundColor: "#ffffff" },
      },
      titleTemplate: "%s | Rimelight",
      og: {
        routes: {
          "*/blog/*": "./src/components/og/BlogOgCard.tsx",
          "*/docs/*": "./src/components/og/DocsOgCard.tsx",
        },
      },
      privatePathPrefixes: [
        "/dashboard",
        "/admin",
        "/internal",
        "/api",
        "/dev",
        "/og",
        "/open-graph",
        "/auth",
      ],
    }),

    security({
      domain: "rimelight.com",
    }),

    auth(),

    i18n(),

    ui({
      logos: {
        logomark: {
          color: "https://cdn.rimelight.com/logos/logomark_color.svg",
          white: "https://cdn.rimelight.com/logos/logomark_white.svg",
          black: "https://cdn.rimelight.com/logos/logomark_black.svg",
        },
        logotype: {
          color: "https://cdn.rimelight.com/logos/logotype_color.svg",
          white: "https://cdn.rimelight.com/logos/logotype_white.svg",
          black: "https://cdn.rimelight.com/logos/logotype_black.svg",
        },
      },
    }),

    cms({ autoMigrate: true, devBypassAuth: true }),

    // Temporary: UI component metadata for the docs pages (see src/docs/vite-plugin.ts).
    uiDocsMeta(),
  ],
});
