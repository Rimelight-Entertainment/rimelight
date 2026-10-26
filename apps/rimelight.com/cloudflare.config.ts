import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
  worker: {
    name: "rimelight-dot-com",
    compatibilityDate: "2026-08-27",
    entrypoint: "./src/fetch.ts",
    cache: {
      enabled: true,
    },
    observability: {
      enabled: true,
      traces: {
        enabled: true,
      },
    },
    triggers: [
      triggers.fetch({ pattern: "rimelight.com/*", zone: "rimelight.com" }),
      triggers.fetch({ pattern: "www.rimelight.com/*", zone: "rimelight.com" }),
    ],
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      BLOB: bindings.r2({
        name: "rimelight-dot-com",
        dev: {
          remote: true,
        },
      }),
      EMAIL: bindings.sendEmail({
        dev: {
          remote: true,
        },
      }),
      RATE_LIMIT: bindings.rateLimit({
        namespace: "1001",
        simple: {
          limit: 100,
          period: 60,
        },
      }),
      RATE_LIMIT_LOGIN: bindings.rateLimit({
        namespace: "1002",
        simple: {
          limit: 10,
          period: 60,
        },
      }),
      CONSTRUCTION_MODE: bindings.secret(),
      CONSTRUCTION_PASSPHRASE: bindings.secret(),
      CONTACT_OWNER_EMAIL: bindings.text("owner@rimelight.com"),
      AUTH0_AUDIENCE: bindings.secret(),
      AUTH0_CLIENT_ID: bindings.secret(),
      AUTH0_CLIENT_SECRET: bindings.secret(),
      AUTH0_DOMAIN: bindings.secret(),
      AUTH0_SECRET: bindings.secret(),
      DATABASE_URL: bindings.secret(),
      HYPERDRIVE: bindings.hyperdrive({
        id: "5889fcb4d3034e909c0f060f18975597",
      }),
      GITHUB_TOKEN: bindings.secret(),
    },
  },
});
