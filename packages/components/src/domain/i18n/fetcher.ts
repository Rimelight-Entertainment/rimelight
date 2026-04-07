import { SITE_CONFIG } from "../../config"
import { TRANSLATIONS_VERSION } from "./runtime-constants"
let env: any = {}
try {
  // @ts-ignore
  env = (await import("cloudflare:workers")).env
} catch {
  // Safe fallback for Node.js environments (Astro config, local scripts)
  env = {}
}
import type { Locale, Namespace, PickSchema } from "./schema"
import { deepMerge } from "../../utils/shared/deep-merge"
import { parseBooleanFlag } from "../../utils/shared/parse-boolean"

// Optional fallbacks (auto-loaded if generated)
let FALLBACKS: Record<string, unknown> | null = null

try {
  FALLBACKS = await import("./fallbacks.generated.ts")
} catch {
  FALLBACKS = null
}

const KV_JSON_OPTIONS = { type: "json" as const, cacheTtl: 3600 }

function assertRecord(obj: unknown): asserts obj is Record<string, unknown> {
  if (!obj || typeof obj !== "object") throw new Error("Expected record")
}

function assertDefaultCache(obj: unknown): asserts obj is {
  match: (r: Request) => Promise<Response | undefined>
  put: (r: Request, res: Response) => Promise<void>
} {
  if (!obj || typeof obj !== "object") throw new Error("Expected cache")
}

function assertSchema<N extends Namespace>(obj: unknown): asserts obj is PickSchema<N> {
  if (!obj) throw new Error("Expected schema")
}

function assertA<N extends Namespace>(obj: unknown): asserts obj is PickSchema<N> {
  if (!obj) throw new Error("Expected result")
}

/**
 * Runtime object provided by Astro via Astro.locals.
 */
export interface Runtime {
  cf?: unknown
  cfContext: { waitUntil: (p: Promise<unknown>) => void }
}

/**
 * Fetch translations from KV for a given locale and list of namespaces.
 *
 * Responsibilities:
 *
 * - Build KV keys using SITE_CONFIG.id, namespace and locale
 * - Optionally use edge cache (controlled by env flag I18N_CACHE)
 * - On cache miss, read from KV and merge with optional FALLBACK_* dictionaries
 * - Persist the merged payload back to the edge cache
 * - If KV is unavailable, fall back to static FALLBACK_* dictionaries only
 */
export async function fetchTranslations<N extends Namespace>(
  runtime: Runtime,
  lang: Locale,
  namespaces: readonly N[]
): Promise<PickSchema<N>> {
  const useCache = isCacheEnabled(env)

  if (!useCache) {
    debug(env, "i18n cache DISABLED, using KV only", { lang, namespaces })
  }

  const { cache, waitUntil } = useCache ? getEdgeCache(runtime) : { cache: null, waitUntil: null }

  const keys = namespaces.map((ns) => `${SITE_CONFIG.id}:${ns}:${lang}`)

  const { cacheRequest } = buildCacheKey(lang, namespaces)

  // 1. Try to serve from edge cache if available and enabled
  if (useCache && cache) {
    try {
      const cached = await cache.match(cacheRequest)

      if (cached) {
        const json = await cached.json()
        assertSchema<N>(json)
        debug(env, "i18n cache HIT", { lang, namespaces })
        return json
      }
      debug(env, "i18n cache MISS (no entry)", { lang, namespaces })
    } catch (error) {
      debug(env, "i18n cache READ error, falling back to KV", error)
    }
  }

  // 2. Cache is missing, disabled, or unavailable → read from KV
  try {
    const data = await loadTranslationsFromKV(env, keys, namespaces)
    debug(env, "i18n KV OK", { lang, namespaces })

    // 3. Store the resulting payload in the edge cache asynchronously (if enabled)
    if (useCache && cache && waitUntil) {
      try {
        const response = new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
          }
        })

        const putPromise = cache.put(cacheRequest, response.clone())

        // In real Workers: schedule as a background task.
        // In dev / non-Workers: just await so cache is actually written.
        if (waitUntil) {
          waitUntil(putPromise)
        } else {
          await putPromise
        }

        debug(env, "i18n cache PUT completed", { lang, namespaces })
      } catch (error) {
        debug(env, "i18n cache WRITE error", error)
      }
    }

    return data
  } catch (error) {
    debug(env, "i18n KV ERROR, using FALLBACK_* only", error)

    // 4. Hard fallback to static FALLBACK_* constants if KV is unavailable
    return buildFallbackOnly(namespaces)
  }
}

/**
 * Narrow runtime.caches and runtime.ctx to the minimal shape needed for using the Cache API and
 * waitUntil in this module.
 */
function getEdgeCache(runtime: Runtime): {
  cache: {
    match: (r: Request) => Promise<Response | undefined>
    put: (r: Request, res: Response) => Promise<void>
  } | null
  waitUntil: ((p: Promise<unknown>) => void) | null
} {
  return {
    cache: getCacheFromStorage(),
    waitUntil: runtime.cfContext?.waitUntil ?? null
  }
}

function getCacheFromStorage(): {
  match: (r: Request) => Promise<Response | undefined>
  put: (r: Request, res: Response) => Promise<void>
} | null {
  const c = Reflect.get(Object(caches), "default")
  try {
    assertDefaultCache(c)
    return c
  } catch {
    return null
  }
}

/**
 * Build a stable cache key and synthetic Request object used with the Cache API. The URL origin is
 * irrelevant; only the string identity matters.
 */
function buildCacheKey<N extends Namespace>(
  lang: Locale,
  namespaces: readonly N[]
): { cacheId: string; cacheRequest: Request } {
  const cacheId = `${SITE_CONFIG.id}:i18n:v${TRANSLATIONS_VERSION}:${lang}:${namespaces.join(",")}`

  const cacheRequest = new Request(`https://i18n-cache/${encodeURIComponent(cacheId)}`)

  return { cacheId, cacheRequest }
}

/**
 * Read bulk translations from KV and merge with optional FALLBACK_* dictionaries. This is the main
 * "happy-path" loader.
 */
async function loadTranslationsFromKV<N extends Namespace>(
  environment: Env,
  keys: string[],
  namespaces: readonly N[]
): Promise<PickSchema<N>> {
  const resultMap = await environment.TRANSLATIONS.get(keys, KV_JSON_OPTIONS)

  const data: Partial<PickSchema<N>> = {}

  for (let i = 0; i < namespaces.length; i++) {
    const ns = namespaces[i]!
    const key = keys[i]!
    const value = resultMap.get(key) ?? {}
    assertRecord(value)

    const fallbackConstName = `FALLBACK_${String(ns).toUpperCase()}`
    const fallback = FALLBACKS?.[fallbackConstName]

    if (fallback) {
      assertRecord(fallback)
      Reflect.set(data, ns, deepMerge(fallback, value))
    } else {
      Reflect.set(data, ns, value)
    }
  }

  assertA<N>(data)
  return data
}

/**
 * Build a payload using only FALLBACK_* dictionaries. Used when KV is unavailable or throws
 * unexpectedly.
 */
function buildFallbackOnly<N extends Namespace>(namespaces: readonly N[]): PickSchema<N> {
  const empty: Partial<PickSchema<N>> = {}

  for (let i = 0; i < namespaces.length; i++) {
    const ns = namespaces[i]!
    const fallbackConstName = `FALLBACK_${String(ns).toUpperCase()}`
    const fallback = FALLBACKS?.[fallbackConstName]

    ;(empty as Record<string, unknown>)[ns] = fallback ?? {}
  }

  assertSchema<N>(empty)
  return empty
}

/**
 * Determine whether edge caching is enabled.
 *
 * Wrangler var: I18N_CACHE = "on" | "off" | "true" | "false" | "1" | "0"
 *
 * After adding the variable:
 *
 * - Update wrangler.jsonc / wrangler.toml or .dev.vars
 * - Run: npm run typegen
 */
function isCacheEnabled(environment: Env): boolean {
  // env.I18N_CACHE is generated by `wrangler types`
  return parseBooleanFlag(environment.I18N_CACHE, /* defaultValue */ true)
}

/**
 * Debug logger controlled by a Wrangler variable.
 *
 * Wrangler var: DEBUG_I18N = "on" | "off" | "true" | "false" | "1" | "0"
 *
 * After adding the variable:
 *
 * - Update wrangler.jsonc / wrangler.toml or .dev.vars
 * - Run: npm run typegen
 */
function debug(environment: Env, ...args: unknown[]) {
  const enabled = parseBooleanFlag(environment.DEBUG_I18N, /* defaultValue */ false)
  if (!enabled) return

  // eslint-disable-next-line no-console
  console.log(...args)
}
