import type { AstroIntegration } from "astro"
import { execSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { generate } from "./core/generator"
import type { CMSConfig } from "./core/define"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface CMSIntegrationOptions {
  config: CMSConfig
  generatedDir?: string
  drizzleConfigPath?: string
}

function pushSchema(configPath: string) {
  execSync(`npx drizzle-kit push --config="${configPath}" --force`, {
    stdio: "inherit",
    cwd: process.cwd()
  })
}

function isCloudflareD1(): boolean {
  const wranglerPath = path.join(process.cwd(), "wrangler.jsonc")
  if (!existsSync(wranglerPath)) return false
  try {
    const content = readFileSync(wranglerPath, "utf-8")
    return content.includes('"d1_databases"')
  } catch {
    return false
  }
}

function hasLocalD1Database(): boolean {
  const dir = path.join(process.cwd(), ".wrangler/state/v3/d1/miniflare-D1DatabaseObject")
  try {
    return readdirSync(dir).some((f) => f.endsWith(".sqlite") && f !== "*.sqlite")
  } catch {
    return false
  }
}

function getD1DatabaseName(): string | null {
  const wranglerPath = path.join(process.cwd(), "wrangler.jsonc")
  try {
    const content = readFileSync(wranglerPath, "utf-8")
    const match = content.match(/"database_name"\s*:\s*"([^"]+)"/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

function initLocalD1() {
  const dbName = getD1DatabaseName()
  if (!dbName) throw new Error("No database_name found in wrangler.jsonc")
  execSync(`npx wrangler d1 execute "${dbName}" --local --command="SELECT 1"`, {
    stdio: "pipe",
    cwd: process.cwd()
  })
}

export default function cmsIntegration(options: CMSIntegrationOptions): AstroIntegration {
  const {
    config,
    generatedDir = path.join(process.cwd(), "src/cms/.generated"),
    drizzleConfigPath = "drizzle.config.ts"
  } = options

  return {
    name: "@rimelight/cms",
    hooks: {
      "astro:config:setup": async ({ command, injectRoute, updateConfig }) => {
        console.log("  \x1b[36m[cms]\x1b[0m Generating schema, types, validators, and API...")

        // Ensure generated dir exists
        if (!existsSync(generatedDir)) {
          mkdirSync(generatedDir, { recursive: true })
        }

        // Run internal generator
        try {
          await generate(config, generatedDir)
        } catch (e) {
          console.error("  [cms] Generator failed:", e)
        }

        // Inject Routes
        // Admin UI
        injectRoute({
          pattern: "/[locale]/admin",
          entrypoint: fileURLToPath(new URL("./routes/admin/[...path].astro", import.meta.url))
        })
        injectRoute({
          pattern: "/[locale]/admin/[...path]",
          entrypoint: fileURLToPath(new URL("./routes/admin/[...path].astro", import.meta.url))
        })
        injectRoute({
          pattern: "/[locale]/admin/login",
          entrypoint: fileURLToPath(new URL("./routes/admin/login.astro", import.meta.url))
        })
        injectRoute({
          pattern: "/[locale]/admin/setup",
          entrypoint: fileURLToPath(new URL("./routes/admin/setup.astro", import.meta.url))
        })
        injectRoute({
          pattern: "/[locale]/admin/invite",
          entrypoint: fileURLToPath(new URL("./routes/admin/invite.astro", import.meta.url))
        })

        // API routes
        const apiEntrypoints = [
          { pattern: "/api/cms/seed", file: "./routes/api/seed.ts" },
          { pattern: "/api/cms/auth/login", file: "./routes/api/auth/login.ts" },
          { pattern: "/api/cms/auth/logout", file: "./routes/api/auth/logout.ts" },
          { pattern: "/api/cms/auth/setup", file: "./routes/api/auth/setup.ts" },
          { pattern: "/api/cms/auth/invite", file: "./routes/api/auth/invite.ts" },
          { pattern: "/api/cms/assets", file: "./routes/api/assets/index.ts" },
          { pattern: "/api/cms/assets/upload", file: "./routes/api/assets/upload.ts" },
          { pattern: "/api/cms/assets/folders", file: "./routes/api/assets/folders.ts" },
          { pattern: "/api/cms/assets/[id]", file: "./routes/api/assets/[id].ts" },
          {
            pattern: "/api/cms/references/[collection]/[id]",
            file: "./routes/api/references/[collection]/[id].ts"
          },
          { pattern: "/api/cms/locks/[...path]", file: "./routes/api/locks/[...path].ts" },
          { pattern: "/api/cms/img/[...path]", file: "./routes/api/img/[...path].ts" },
          { pattern: "/api/cms/ai/seo", file: "./routes/api/ai/seo.ts" },
          { pattern: "/api/cms/ai/alt-text", file: "./routes/api/ai/alt-text.ts" },
          { pattern: "/api/cms/ai/translate", file: "./routes/api/ai/translate.ts" },
          { pattern: "/api/cms/cron/publish", file: "./routes/api/cron/publish.ts" },
          {
            pattern: "/api/cms/[collection]/[...path]",
            file: "./routes/api/[collection]/[...path].ts"
          }
        ]

        for (const { pattern, file } of apiEntrypoints) {
          injectRoute({
            pattern,
            entrypoint: fileURLToPath(new URL(file, import.meta.url)),
            prerender: false
          })
        }

        // Add Vite aliases for core and generated code so injected routes can find them
        updateConfig({
          vite: {
            resolve: {
              alias: {
                "@/core": path.join(__dirname, "core"),
                "@/components": path.join(__dirname, "components"),
                "@/lib": path.join(__dirname, "lib"),
                "@/layouts": path.join(__dirname, "layouts"),
                "@/generated": generatedDir
              }
            }
          }
        })

        if (command === "dev") {
          // Database setup logic (same as original)
          const useD1 = isCloudflareD1()
          if (useD1) {
            if (!hasLocalD1Database()) {
              console.log("  \x1b[36m[cms]\x1b[0m First run — setting up database...")
              try {
                initLocalD1()
              } catch (e) {
                console.error("  [cms] D1 init failed:", e)
              }
            }
            try {
              pushSchema(drizzleConfigPath)
            } catch (e) {
              console.error("  [cms] DB push failed:", e)
            }
          } else {
            mkdirSync(path.join(process.cwd(), "data"), { recursive: true })
            try {
              pushSchema(drizzleConfigPath)
            } catch (e) {
              console.error("  [cms] DB push failed:", e)
            }
          }
        }
      },

      "astro:server:start": ({ address }) => {
        const host = address.family === "IPv6" ? `[${address.address}]` : address.address
        const base = `http://${host === "[::1]" || host === "127.0.0.1" || host === "[::]" ? "localhost" : host}:${address.port}`
        console.log(`  \x1b[36m[cms]\x1b[0m Admin panel: \x1b[36m${base}/en/admin\x1b[0m`)
      }
    }
  }
}
