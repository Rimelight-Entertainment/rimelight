import { Buffer } from "node:buffer"
import { createHash } from "node:crypto"
import fs from "node:fs"
import fsp from "node:fs/promises"
import { join, resolve } from "node:path"
import process from "node:process"
import { presetWebFonts } from "unocss"

export interface LocalFontProcessorOptions {
  cwd?: string
  cacheDir?: string
  fontAssetsDir?: string
  fontServeBaseUrl?: string
  fetch?: (url: string) => Promise<ArrayBuffer | Response>
  onDownload?: (filename: string, buf: Buffer) => void | Promise<void>
}

export interface ResolvedFontPaths {
  cwd: string
  cacheDir: string
  fontAssetsDir: string
  fontServeBaseUrl: string
}

/**
 * Resolves the on-disk cache locations for fonts. Fonts never touch `public/`: binaries live under
 * `node_modules/.cache` and are served via Vite middleware in dev and emitted as bundle assets in
 * build (Astro-style).
 */
export function resolveFontPaths(options?: LocalFontProcessorOptions): ResolvedFontPaths {
  const cwd = options?.cwd || process.cwd()
  const cacheDir = resolve(cwd, options?.cacheDir || "node_modules/.cache/unocss/fonts")
  const fontAssetsDir = resolve(cwd, options?.fontAssetsDir || join(cacheDir, "files"))
  const fontServeBaseUrl = options?.fontServeBaseUrl || "/assets/fonts"
  return { cwd, cacheDir, fontAssetsDir, fontServeBaseUrl }
}

/**
 * Shared in-memory font store. The Uno processor fills it on download and the Vite plugin
 * (`rimelightFontsVitePlugin`) serves/emits from it, so dev and build stay in sync within a single
 * Vite process.
 */
export const emittedFonts = new Map<string, Buffer>()

export const DEFAULT_UI_FONTS = {
  provider: "fontsource" as WebFontsProviders,
  fonts: {
    sans: [
      {
        name: "Noto Sans",
        weights: [400, 500, 600, 700],
        subsets: ["latin", "latin-ext"]
      }
    ],
    serif: [
      {
        name: "Noto Serif",
        weights: [400, 700],
        subsets: ["latin", "latin-ext"]
      }
    ],
    mono: [
      {
        name: "JetBrains Mono",
        weights: [400, 500, 700],
        subsets: ["latin", "latin-ext"]
      }
    ]
  }
}

const fontUrlRegex = /[-\w@:%+.~#?&/=]+\.(?:woff2?|eot|ttf|otf|svg)/gi
const urlProtocolRegex = /^[\s\w\0+.-]{2,}:[/\\]{1,2}/

function getHash(input: string, length = 8) {
  return createHash("sha256").update(input).digest("hex").slice(0, length)
}

function hasProtocol(input: string) {
  return urlProtocolRegex.test(input)
}

function withProtocol(input: string) {
  return input.startsWith("//") ? `https:${input}` : `https://${input}`
}

/**
 * Creates a local font processor that downloads remote web fonts (Google, Fontshare, etc.) and
 * serves them locally. Binaries are cached outside `public/` (see `resolveFontPaths`) and served
 * via `rimelightFontsVitePlugin` in dev / emitted as bundle assets in build.
 */
export function createLocalFontProcessor(options?: LocalFontProcessorOptions) {
  const { cacheDir, fontAssetsDir, fontServeBaseUrl } = resolveFontPaths(options)

  async function remember(filename: string, buf: Buffer) {
    emittedFonts.set(filename, buf)
    if (options?.onDownload) {
      await options.onDownload(filename, buf)
    }
  }

  async function _downloadFont(url: string, assetPath: string) {
    let buf: Buffer
    if (options?.fetch) {
      const res = await options.fetch(url)
      if (res instanceof ArrayBuffer) {
        buf = Buffer.from(res)
      } else if ("arrayBuffer" in res && typeof res.arrayBuffer === "function") {
        buf = Buffer.from(await res.arrayBuffer())
      } else {
        buf = Buffer.from(res as any)
      }
    } else {
      const res = await fetch(url)
      buf = Buffer.from(await res.arrayBuffer())
    }

    const filename = assetPath.split(/[\\/]/).pop()!
    await remember(filename, buf)
    await fsp.mkdir(fontAssetsDir, { recursive: true })
    await fsp.writeFile(assetPath, buf)
  }

  const cache = new Map<string, Promise<void>>()
  function downloadFont(url: string, assetPath: string) {
    if (!cache.has(url)) cache.set(url, _downloadFont(url, assetPath))
    return cache.get(url)!
  }

  return {
    async getCSS(fonts: any, providers: any, getCSSDefault: any) {
      const hash = getHash(JSON.stringify(fonts))
      const cachePath = join(cacheDir, `${hash}.css`)
      if (fs.existsSync(cachePath)) return fsp.readFile(cachePath, "utf-8")
      const css = await getCSSDefault(fonts, providers)
      await fsp.mkdir(cacheDir, { recursive: true })
      await fsp.writeFile(cachePath, css, "utf-8")
      return css
    },
    async transformCSS(css: string) {
      const matches = css.match(fontUrlRegex) || []
      const replacements = new Map<string, string>()
      await Promise.all(
        Array.from(new Set(matches)).map(async (url) => {
          const hash = getHash(url)
          const ext = url.split(".").pop()
          let name = ""
          const match1 = url.match(/\/s\/([^/]+)\//)
          if (match1) name = match1[1]!.replace(/\W/g, " ").trim().replace(/\s+/, "-").toLowerCase()
          const filename = `${[name, hash].filter(Boolean).join("-")}.${ext}`
          const assetPath = join(fontAssetsDir, filename)
          if (!fs.existsSync(assetPath))
            await downloadFont(hasProtocol(url) ? url : withProtocol(url), assetPath)
          else if (!emittedFonts.has(filename))
            emittedFonts.set(filename, await fsp.readFile(assetPath))
          replacements.set(url, `${fontServeBaseUrl}/${filename}`)
        })
      )
      return css.replace(fontUrlRegex, (match) => replacements.get(match) || match)
    }
  }
}

const FONT_MIME_TYPES: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
  svg: "image/svg+xml"
}

/**
 * Vite plugin companion to `createLocalFontProcessor`. Serves cached fonts from memory/disk in dev
 * and emits them as bundle assets in build, so no font files ever need to live in `public/`.
 */
export function rimelightFontsVitePlugin(options?: LocalFontProcessorOptions) {
  const { fontAssetsDir, fontServeBaseUrl } = resolveFontPaths(options)
  const basePrefix = fontServeBaseUrl.endsWith("/") ? fontServeBaseUrl : `${fontServeBaseUrl}/`

  async function readFont(filename: string): Promise<Buffer | null> {
    const cached = emittedFonts.get(filename)
    if (cached) return cached
    try {
      const buf = await fsp.readFile(join(fontAssetsDir, filename))
      emittedFonts.set(filename, buf)
      return buf
    } catch {
      return null
    }
  }

  return {
    name: "rimelight:fonts",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        try {
          const rawUrl = typeof req.url === "string" ? req.url.split("?")[0]! : ""
          const pathname = decodeURIComponent(rawUrl)
          if (!pathname.startsWith(basePrefix)) return next()
          if (req.method && req.method !== "GET" && req.method !== "HEAD") return next()
          const filename = pathname.slice(basePrefix.length)
          if (
            !filename ||
            filename.includes("/") ||
            filename.includes("\\") ||
            filename.includes("..")
          )
            return next()
          const buf = await readFont(filename)
          if (!buf) return next()
          const ext = filename.split(".").pop()?.toLowerCase() || ""
          res.setHeader("Content-Type", FONT_MIME_TYPES[ext] || "application/octet-stream")
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
          res.setHeader("Content-Length", buf.length)
          res.end(req.method === "HEAD" ? undefined : buf)
        } catch {
          next()
        }
      })
    },
    async generateBundle(this: any) {
      try {
        const entries = await fsp.readdir(fontAssetsDir).catch(() => [])
        await Promise.all(
          entries.map(async (filename) => {
            if (!emittedFonts.has(filename)) {
              try {
                emittedFonts.set(filename, await fsp.readFile(join(fontAssetsDir, filename)))
              } catch {
                // ignore unreadable cache entries
              }
            }
          })
        )
      } catch {
        // no cache yet — nothing to emit
      }
      for (const [filename, source] of emittedFonts) {
        this.emitFile({ type: "asset", fileName: `assets/fonts/${filename}`, source })
      }
    }
  }
}

export type WebFontsProviders =
  | "google"
  | "bunny"
  | "fontshare"
  | "none"
  | "fontsource"
  | (string & {})

export interface WebFontsOptions {
  provider?: WebFontsProviders
  fonts?: Record<string, any>
  processors?: any
  processorOptions?: LocalFontProcessorOptions
  [key: string]: any
}

/**
 * Creates the default web fonts preset with local font processing always enabled. Fonts are
 * downloaded once into `node_modules/.cache`, served from memory/disk in dev and emitted as bundle
 * assets in build — `public/` stays untouched.
 */
export function resolveWebFontsPreset(options?: WebFontsOptions | boolean) {
  if (options === false) return null

  const userOpts: WebFontsOptions = typeof options === "object" && options !== null ? options : {}
  // `local` was the old opt-in flag; local serving is now unconditional.
  // `processors`/`processorOptions` are ours — strip them so they don't leak
  // into presetWebFonts (`processors` is re-attached resolved below).
  const {
    processors,
    processorOptions,
    local: _deprecatedLocal,
    provider,
    fonts,
    ...restPresetOpts
  } = userOpts
  const mergedFonts = {
    ...DEFAULT_UI_FONTS.fonts,
    ...fonts
  }

  const resolvedProcessors = processors ?? [createLocalFontProcessor(processorOptions)]

  return presetWebFonts({
    ...restPresetOpts,
    provider: (provider || DEFAULT_UI_FONTS.provider) as any,
    fonts: mergedFonts,
    processors: Array.isArray(resolvedProcessors) ? resolvedProcessors : [resolvedProcessors]
  })
}
