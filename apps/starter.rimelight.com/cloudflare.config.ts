import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
  worker: {
    name: "starter-dot-rimelight-dot-com",
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
      triggers.fetch({ pattern: "starter.rimelight.com/*", zone: "rimelight.com" }),
      triggers.fetch({ pattern: "www.starter.rimelight.com/*", zone: "rimelight.com" }),
      triggers.scheduled({
        schedule: "* * * * *",
      }),
    ],
    env: {
      CONSTRUCTION_MODE: bindings.text("true"),
      EMAIL_DOMAIN: bindings.text("rimelight.com"),
      CONTACT_OWNER_EMAIL: bindings.text("owner@rimelight.com"),
      CONSTRUCTION_PASSPHRASE: bindings.secret(),
      DB: bindings.d1({
        id: "a6610294-e214-4d35-b841-174469da54d2",
        dev: {
          remote: true,
        },
      }),
      BLOB: bindings.r2({
        name: "starter-dot-rimelight-dot-com",
        dev: {
          remote: true,
        },
      }),
      EMAIL: bindings.sendEmail({
        dev: {
          remote: true,
        },
      }),
      MY_RATE_LIMITER: bindings.rateLimit({
        namespace: "1001",
        simple: {
          limit: 100,
          period: 60,
        },
      }),
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
    },
  },
});
