import { defineConfig } from "vite-plus";
import { cloudflare } from "@cloudflare/vite-plugin";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { seo } from "@rimelight/seo/plugin";
import { security } from "@rimelight/security/plugin";
import { auth } from "@rimelight/auth/plugin";
import { i18n } from "@rimelight/i18n/plugin";
import { ui } from "@rimelight/ui/plugin";
import { PALETTES } from "@rimelight/ui/preset";
import type { UIConfig } from "@rimelight/ui/types";
import { cms } from "@rimelight/cms/plugin";

const uiConfig: UIConfig = {
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
};

const auditColors = [...new Set([...Object.keys(PALETTES), ...Object.keys(uiConfig.colors ?? {})])];

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
      experimental: {
        newConfig: true,
      },
    }),

    solid({
      exclude: ["src/fetch.ts"],
      start: true,
      ssr: true,
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
      locales: {
        en: "en-US",
        pt: "pt-BR",
        es: "es-ES",
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
      imgSrc: ["https://s.gravatar.com", "https://cdn.auth0.com", "https://i1.wp.com"],
      ratelimit: {
        routes: ["/auth/sign-in", "/auth/sign-up", "/api/upload", "/api/chat", "/api/contact"],
      },
    }),

    auth({
      roleGuards: {
        "/internal": {
          roles: ["employee", "staff", "admin", "owner"],
          userTypes: ["employee"],
        },
        "/api/internal": {
          roles: ["employee", "staff", "admin", "owner"],
          userTypes: ["employee"],
        },
        "/admin": ["admin", "owner"],
      },
    }),

    i18n(),

    ui(uiConfig),

    {
      name: "audits/colors",
      enforce: "pre",
      resolveId: (id: string) =>
        id === "virtual:audits/colors" ? "\0virtual:audits/colors" : null,
      load: (id: string) =>
        id === "\0virtual:audits/colors" ? `export default ${JSON.stringify(auditColors)};` : null,
    },

    cms(),

    {
      name: "virtual:rimelight-ui-docs-meta",
      resolveId(id: string) {
        if (id === "virtual:rimelight-ui-docs-meta") return "\0virtual:rimelight-ui-docs-meta";
        if (id === "cloudflare:workers") return "\0cloudflare:workers";
        return null;
      },
      load(id: string) {
        if (id === "\0virtual:rimelight-ui-docs-meta") return "export default {};";
        if (id === "\0cloudflare:workers") return "export const env = {};";
        return null;
      },
    },
  ],
});
