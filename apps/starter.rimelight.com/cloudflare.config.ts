import { bindings, defineConfig, exports, triggers, type InferEnv } from "cf/config"

const config = defineConfig({
  worker: {
    name: "starter-dot-rimelight-dot-com",
    compatibilityDate: "2026-08-27",
    entrypoint: "./src/fetch.ts",
    cache: {
      enabled: true
    },
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        headSamplingRate: 1,
        invocationLogs: true
      },
      traces: {
        enabled: true
      }
    },
    domains: ["starter.rimelight.com", "www.starter.rimelight.com"],
    triggers: [
      triggers.scheduled({
        schedule: "* * * * *"
      })
    ],
    exports: {
      ChatRoom: exports.durableObject({ storage: "sqlite" })
    },
    env: {
      "CONSTRUCTION_MODE": bindings.text("true"),
      "EMAIL_DOMAIN": bindings.text("rimelight.com"),
      "CONTACT_OWNER_EMAIL": bindings.text("owner@rimelight.com"),
      "TURNSTILE_SITE_KEY": bindings.secret(),
      "TURNSTILE_SECRET_KEY": bindings.secret(),
      "CONSTRUCTION_PASSPHRASE": bindings.secret(),
      "DB": bindings.d1({
        name: "starter-dot-rimelight-dot-com",
        id: "a6610294-e214-4d35-b841-174469da54d2",
        dev: {
          remote: true
        }
      }),
      "starter-dot-rimelight-dot-com_translations": bindings.kv({
        id: "8c09f90741704096bd1dcdf2abadc974",
        dev: {
          remote: true
        }
      }),
      "BLOB": bindings.r2({
        name: "starter-dot-rimelight-dot-com",
        dev: {
          remote: true
        }
      }),
      "EMAIL": bindings.sendEmail({
        dev: {
          remote: true
        }
      }),
      "ChatRoom": bindings.durableObject({
        worker: "starter-dot-rimelight-dot-com",
        exportName: "ChatRoom"
      }),
      "MY_RATE_LIMITER": bindings.rateLimit({
        namespace: "1001",
        simple: {
          limit: 100,
          period: 60
        }
      }),
      "ASSETS": bindings.assets()
    }
  }
})

export type Env = InferEnv<typeof config>
export default config
