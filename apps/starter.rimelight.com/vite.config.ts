import { defineConfig } from "vite-plus";
import { fileRoutes } from "filesystem-routing/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import solid from "@solidjs/vite-plugin";
import { ui } from "@rimelight/ui/plugin";
import { seo } from "@rimelight/seo/plugin";
import { security } from "@rimelight/security/plugin";
import { auth } from "@rimelight/auth/plugin";
import { i18n } from "@rimelight/i18n/plugin";
import en from "./src/i18n/en.json";
import es from "./src/i18n/es.json";
import pt from "./src/i18n/pt.json";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    "*": "vp check --fix",
  },
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
      start: true,
      ssr: true,
    }),

    fileRoutes({ types: true }),

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

    seo({
      id: "starter.rimelight.com",
      url: "https://starter.rimelight.com",
      name: "Rimelight Starter",
      description: "Welcome to my website!",
      author: "Rimelight",
      branding: {
        logo: { alt: "Rimelight Starter" },
        favicon: { svg: "https://cdn.rimelight.com/logos/logomark_color.svg" },
        appleTouchIcon: "https://cdn.rimelight.com/logos/logomark_color.svg",
        colors: { themeColor: "#ffffff", backgroundColor: "#ffffff" },
      },
      titleTemplate: "%s | Rimelight Starter",
      locales: {
        en: "en-US",
        pt: "pt-BR",
        es: "es-ES",
      },
      privatePathPrefixes: ["/api", "/cdn-cgi"],
    }),

    security({
      domain: "starter.rimelight.com",
      imgSrc: ["https://s.gravatar.com", "https://cdn.auth0.com", "https://i1.wp.com"],
    }),

    auth({
      roleGuards: {
        "/admin": ["admin", "owner"],
      },
    }),

    i18n({
      locales: ["en", "pt", "es"],
      defaultLocale: "en",
      translations: { en, es, pt },
    }),
  ],
});
