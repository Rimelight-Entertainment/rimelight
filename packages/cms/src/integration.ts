import type { AstroIntegration } from "astro"
import path from "node:path"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import type { StorageConfig } from "./storage/index"
import type { AuthAdapter } from "@rimelight/auth"

export interface RimelightCmsOptions {
  /**
   * Route prefix for CMS admin pages. Defaults to "/[locale]/cms" (or "/cms" if no locale routing).
   */
  routePrefix?: string | undefined

  /**
   * Optional outer layout to wrap the CMS dashboard in (e.g. "./src/layouts/AppLayout.astro"). When
   * omitted, renders as a dedicated standalone full-viewport dashboard.
   */
  parentLayout?: string | undefined

  /**
   * Path to the app database instance module exporting `db`. Defaults to "./src/db/index.ts" or
   * "./src/db".
   */
  db?: string | undefined

  /**
   * Storage backend configuration (e.g. r2({ binding: "BLOB", publicUrl:
   * "https://media.example.com" })).
   */
  storage?: StorageConfig | undefined

  /**
   * Pluggable Auth Adapter instance or module path (RFC-0004 / RFC-0006). E.g. cfAccessAuth({ ...
   * }), auth0Auth({ ... }), or mockAuth().
   */
  auth?: AuthAdapter | string | undefined
}

export function rimelightCms(options: RimelightCmsOptions = {}): AstroIntegration {
  const routePrefix = options.routePrefix ?? "/[locale]/cms"
  const storageConfig = {
    provider: options.storage?.provider ?? "r2",
    binding: options.storage?.binding ?? "BLOB",
    publicUrl: options.storage?.publicUrl,
    prefix: options.storage?.prefix ?? "media/"
  }

  return {
    name: "@rimelight/cms",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig, config }) => {
        const rootDir = fileURLToPath(config.root)

        // Resolve parent layout if provided
        let resolvedParentLayout: string | null = null
        if (options.parentLayout) {
          resolvedParentLayout = path.isAbsolute(options.parentLayout)
            ? options.parentLayout
            : path.resolve(rootDir, options.parentLayout)
        }

        // Resolve db module if exists
        let resolvedDb: string | null = null
        if (options.db) {
          resolvedDb = path.isAbsolute(options.db) ? options.db : path.resolve(rootDir, options.db)
        } else {
          const defaultDbTs = path.resolve(rootDir, "src/db/index.ts")
          const defaultDbJs = path.resolve(rootDir, "src/db/index.js")
          if (fs.existsSync(defaultDbTs)) {
            resolvedDb = defaultDbTs
          } else if (fs.existsSync(defaultDbJs)) {
            resolvedDb = defaultDbJs
          }
        }

        // Resolve auth module / adapter code
        let resolvedAuthCode: string
        if (typeof options.auth === "string") {
          const resolvedAuthPath = path.isAbsolute(options.auth)
            ? options.auth
            : path.resolve(rootDir, options.auth)
          resolvedAuthCode = `export { authAdapter, authAdapter as default } from ${JSON.stringify(resolvedAuthPath)};`
        } else if (options.auth && typeof options.auth === "object") {
          const authObj = options.auth as any
          const adapterName = authObj.name || "mock"
          const adapterOpts = authObj.options || {}

          if (adapterName === "cf-access") {
            resolvedAuthCode = `import { cfAccessAuth } from "@rimelight/auth/cf-access";
export const authAdapter = cfAccessAuth(${JSON.stringify(adapterOpts)});
export default authAdapter;`
          } else if (adapterName === "auth0") {
            resolvedAuthCode = `import { auth0Auth } from "@rimelight/auth/auth0";
export const authAdapter = auth0Auth(${JSON.stringify(adapterOpts)});
export default authAdapter;`
          } else {
            resolvedAuthCode = `import { mockAuth } from "@rimelight/auth/mock";
export const authAdapter = mockAuth(${JSON.stringify(adapterOpts)});
export default authAdapter;`
          }
        } else {
          // Default fallback mock admin adapter for development
          resolvedAuthCode = `import { mockAuth } from "@rimelight/auth/mock";
export const authAdapter = mockAuth({
  session: {
    userId: "cms-admin",
    name: "CMS Administrator",
    email: "admin@rimelight.com",
    roles: ["admin", "editor"],
    permissions: ["*"],
    userType: "employee"
  }
});
export default authAdapter;`
        }

        // 1. Inject CMS admin routes
        injectRoute({
          pattern: `${routePrefix}`,
          entrypoint: "@rimelight/cms/admin/pages/dashboard.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/pages`,
          entrypoint: "@rimelight/cms/admin/pages/pages-index.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/pages/new`,
          entrypoint: "@rimelight/cms/admin/pages/pages-new.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/pages/[id]/edit`,
          entrypoint: "@rimelight/cms/admin/pages/pages-edit.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/pages/[id]/preview`,
          entrypoint: "@rimelight/cms/admin/pages/pages-preview.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/pages/[id]/review`,
          entrypoint: "@rimelight/cms/admin/pages/pages-review.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/templates`,
          entrypoint: "@rimelight/cms/admin/pages/templates-index.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/templates/new`,
          entrypoint: "@rimelight/cms/admin/pages/templates-new.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/templates/[id]/edit`,
          entrypoint: "@rimelight/cms/admin/pages/templates-edit.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/assets`,
          entrypoint: "@rimelight/cms/admin/pages/assets.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/categories`,
          entrypoint: "@rimelight/cms/admin/pages/categories.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/tags`,
          entrypoint: "@rimelight/cms/admin/pages/tags.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/bylines`,
          entrypoint: "@rimelight/cms/admin/pages/bylines.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/versions`,
          entrypoint: "@rimelight/cms/admin/pages/versions.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/content-types`,
          entrypoint: "@rimelight/cms/admin/pages/content-types.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/byline-schema`,
          entrypoint: "@rimelight/cms/admin/pages/byline-schema.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/users`,
          entrypoint: "@rimelight/cms/admin/pages/users.astro"
        })
        injectRoute({
          pattern: `${routePrefix}/settings`,
          entrypoint: "@rimelight/cms/admin/pages/settings.astro"
        })

        // Media API Routes
        injectRoute({
          pattern: `${routePrefix}/api/media`,
          entrypoint: "@rimelight/cms/admin/api/media.ts"
        })
        injectRoute({
          pattern: `${routePrefix}/api/media/file/[...key]`,
          entrypoint: "@rimelight/cms/admin/api/media-file.ts"
        })

        // 2. Vite plugin for virtual modules
        updateConfig({
          vite: {
            plugins: [
              {
                name: "vite-plugin-rimelight-cms-virtuals",
                resolveId(id) {
                  if (id === "virtual:rimelight-cms/parent-layout") {
                    return "\0virtual:rimelight-cms/parent-layout"
                  }
                  if (id === "virtual:rimelight-cms/db") {
                    return "\0virtual:rimelight-cms/db"
                  }
                  if (id === "virtual:rimelight-cms/storage") {
                    return "\0virtual:rimelight-cms/storage"
                  }
                  if (id === "virtual:rimelight-cms/auth") {
                    return "\0virtual:rimelight-cms/auth"
                  }
                  return undefined
                },
                load(id) {
                  if (id === "\0virtual:rimelight-cms/parent-layout") {
                    if (resolvedParentLayout && fs.existsSync(resolvedParentLayout)) {
                      return `export { default } from ${JSON.stringify(resolvedParentLayout)};`
                    }
                    return `export { default } from "@rimelight/cms/admin/layouts/DefaultParentLayout.astro";`
                  }
                  if (id === "\0virtual:rimelight-cms/db") {
                    if (resolvedDb && fs.existsSync(resolvedDb)) {
                      return `export * from ${JSON.stringify(resolvedDb)};`
                    }
                    return `export const db = null;`
                  }
                  if (id === "\0virtual:rimelight-cms/storage") {
                    return `export const storageConfig = ${JSON.stringify(storageConfig)};`
                  }
                  if (id === "\0virtual:rimelight-cms/auth") {
                    return resolvedAuthCode
                  }
                  return undefined
                }
              }
            ]
          }
        })
      }
    }
  }
}
