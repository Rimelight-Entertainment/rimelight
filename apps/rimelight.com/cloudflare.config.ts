import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "rimelight-dot-com",
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
    domains: ["rimelight.com", "www.rimelight.com"],
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      BLOB: bindings.r2({
        name: "rimelight-dot-com",
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
      RATE_LIMIT_SETTINGS: bindings.rateLimit({
        namespace: "1003",
        simple: {
          limit: 30,
          period: 60,
        },
      }),
      CONSTRUCTION_MODE: bindings.secret(),
      CONSTRUCTION_PASSPHRASE: bindings.secret(),
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
