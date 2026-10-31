import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
  worker: {
    name: "starter-dot-rimelight-dot-com",
    compatibilityDate: "2026-10-01",
    entrypoint: "./src/fetch.ts",
    observability: {
      enabled: true,
      traces: {
        enabled: true,
      },
      issues: {
        enabled: true,
      },
    },
    cache: {
      enabled: true,
    },
    triggers: [
      triggers.fetch({ pattern: "starter.rimelight.com/*", zone: "rimelight.com" }),
      triggers.fetch({ pattern: "www.starter.rimelight.com/*", zone: "rimelight.com" }),
    ],
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      BLOB: bindings.r2({
        name: "starter-dot-rimelight-dot-com",
      }),
      DB: bindings.d1({
        id: "a6610294-e214-4d35-b841-174469da54d2",
      }),
      EMAIL: bindings.sendEmail(),
      RATE_LIMIT: bindings.rateLimit({
        namespace: "1001",
        simple: {
          limit: 100,
          period: 60,
        },
      }),
      CONSTRUCTION_MODE: bindings.secret(),
      CONSTRUCTION_PASSPHRASE: bindings.secret(),
      CONTACT_OWNER_EMAIL: bindings.text("owner@rimelight.com"),
    },
  },
});
