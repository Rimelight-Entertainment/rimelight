import path from "node:path"
import fs from "node:fs"
import type { Plugin } from "vite-plus"
import type { StorageConfig } from "./storage/index.ts"
import type { AuthAdapter } from "@rimelight/auth"

export interface RimelightCmsPluginOptions {
  /**
   * Route prefix for CMS admin pages. Defaults to "/[locale]/cms".
   */
  routePrefix?: string | undefined

  /**
   * Path to the app database instance module exporting `db`. Defaults to auto-discovered
   * "./src/db/index.ts".
   */
  db?: string | undefined

  /**
   * Storage backend configuration (e.g. r2({ binding: "BLOB", publicUrl:
   * "https://media.example.com" })).
   */
  storage?: StorageConfig | undefined

  /**
   * Pluggable Auth Adapter instance or module path.
   */
  auth?: AuthAdapter | string | undefined
}

export type RimelightCmsPlugin = Plugin

const VIRTUAL_CMS = "virtual:rimelight/cms"
const VIRTUAL_CMS_CONFIG = "virtual:rimelight/cms/config"
const VIRTUAL_CMS_STORAGE = "virtual:rimelight/cms/storage"
const VIRTUAL_CMS_AUTH = "virtual:rimelight/cms/auth"
const VIRTUAL_CMS_DB = "virtual:rimelight/cms/db"

const LEGACY_IDS = [
  "virtual:rimelight-cms/parent-layout",
  "virtual:rimelight-cms/db",
  "virtual:rimelight-cms/storage",
  "virtual:rimelight-cms/auth"
]

/**
 * Framework-agnostic Vite plugin for Rimelight CMS.
 *
 * Replaces the legacy Astro integration (`rimelightCms()`). Exposes virtual modules consumed by
 * Solid routes and Hono API handlers:
 *
 * - `virtual:rimelight/cms` / `virtual:rimelight/cms/config` — resolved plugin options
 * - `virtual:rimelight/cms/storage` — storage backend configuration
 * - `virtual:rimelight/cms/auth` — auth adapter module
 * - `virtual:rimelight/cms/db` — app database re-export (or null stub)
 */
export function cms(options: RimelightCmsPluginOptions = {}): RimelightCmsPlugin {
  let rootDir = process.cwd()

  const storageConfig = {
    provider: options.storage?.provider ?? "r2",
    binding: options.storage?.binding ?? "BLOB",
    publicUrl: options.storage?.publicUrl,
    prefix: options.storage?.prefix ?? "media/"
  }
  const routePrefix = options.routePrefix ?? "/[locale]/cms"

  const resolveAuthCode = (): string => {
    if (typeof options.auth === "string") {
      const resolvedAuthPath = path.isAbsolute(options.auth)
        ? options.auth
        : path.resolve(rootDir, options.auth)
      if (fs.existsSync(resolvedAuthPath)) {
        return `export { authAdapter, authAdapter as default } from ${JSON.stringify(resolvedAuthPath)};`
      }
      return `import { authAdapter } from "virtual:rimelight-auth";\nexport { authAdapter, authAdapter as default };`
    }
    if (options.auth && typeof options.auth === "object") {
      const authObj = options.auth as any
      const adapterName = authObj.name || authObj.adapter || "mock"
      const adapterOpts = authObj.options || {}
      if (adapterName === "cf-access") {
        return `import { cfAccessAuth } from "@rimelight/auth/cf-access";\nexport const authAdapter = cfAccessAuth(${JSON.stringify(adapterOpts)});\nexport default authAdapter;`
      }
      if (adapterName === "auth0") {
        return `import { createAuth0FromEnv } from "@rimelight/auth/auth0";\nexport const authAdapter = createAuth0FromEnv(${JSON.stringify(adapterOpts)});\nexport default authAdapter;`
      }
      return `import { mockAuth } from "@rimelight/auth/mock";\nexport const authAdapter = mockAuth(${JSON.stringify(adapterOpts)});\nexport default authAdapter;`
    }
    return `import { authAdapter } from "virtual:rimelight-auth";\nexport { authAdapter, authAdapter as default };`
  }

  const resolveDbCode = (): string => {
    const candidates = options.db
      ? [path.isAbsolute(options.db) ? options.db : path.resolve(rootDir, options.db)]
      : [
          path.resolve(rootDir, "src/db/index.ts"),
          path.resolve(rootDir, "src/db/index.js"),
          path.resolve(rootDir, "src/db")
        ]
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return `export * from ${JSON.stringify(candidate)};`
    }
    return `export const db = null;`
  }

  return {
    name: "vite-plugin-rimelight-cms",
    configResolved(config) {
      rootDir = config.root || process.cwd()
    },
    resolveId(id) {
      if (
        id === VIRTUAL_CMS ||
        id === VIRTUAL_CMS_CONFIG ||
        id === VIRTUAL_CMS_STORAGE ||
        id === VIRTUAL_CMS_AUTH ||
        id === VIRTUAL_CMS_DB
      ) {
        return `\0${id}`
      }
      if (LEGACY_IDS.includes(id)) {
        if (id === "virtual:rimelight-cms/storage") return `\0${VIRTUAL_CMS_STORAGE}`
        if (id === "virtual:rimelight-cms/auth") return `\0${VIRTUAL_CMS_AUTH}`
        if (id === "virtual:rimelight-cms/db") return `\0${VIRTUAL_CMS_DB}`
        return `\0${VIRTUAL_CMS_CONFIG}`
      }
      return null
    },
    load(id) {
      if (id === `\0${VIRTUAL_CMS}` || id === `\0${VIRTUAL_CMS_CONFIG}`) {
        return `export const routePrefix = ${JSON.stringify(routePrefix)};\nexport const storageConfig = ${JSON.stringify(storageConfig)};\nexport const cmsOptions = ${JSON.stringify({ routePrefix, storage: storageConfig })};\nexport default cmsOptions;`
      }
      if (id === `\0${VIRTUAL_CMS_STORAGE}`) {
        return `export const storageConfig = ${JSON.stringify(storageConfig)};\nexport default storageConfig;`
      }
      if (id === `\0${VIRTUAL_CMS_AUTH}`) {
        return resolveAuthCode()
      }
      if (id === `\0${VIRTUAL_CMS_DB}`) {
        return resolveDbCode()
      }
      return null
    }
  }
}

export { cms as rimelightCmsPlugin }
export default cms
