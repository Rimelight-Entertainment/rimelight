import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { presetWebFonts } from "unocss";

export interface LocalFontProcessorOptions {
  cwd?: string;
  cacheDir?: string;
  fontAssetsDir?: string;
  fontServeBaseUrl?: string;
  fetch?: (url: string) => Promise<ArrayBuffer | Response>;
  onDownload?: (filename: string, buf: Buffer) => void | Promise<void>;
}

export interface ResolvedFontPaths {
  cwd: string;
  cacheDir: string;
  fontAssetsDir: string;
  fontServeBaseUrl: string;
}

/**
 * Resolves the on-disk cache locations for fonts under `node_modules/.cache`.
 */
export function resolveFontPaths(options?: LocalFontProcessorOptions): ResolvedFontPaths {
  const cwd = options?.cwd || process.cwd();
  const cacheDir = resolve(cwd, options?.cacheDir || "node_modules/.cache/unocss/fonts");
  const fontAssetsDir = resolve(cwd, options?.fontAssetsDir || join(cacheDir, "files"));
  const fontServeBaseUrl = options?.fontServeBaseUrl || "/assets/fonts";
  return { cwd, cacheDir, fontAssetsDir, fontServeBaseUrl };
}

export const DEFAULT_UI_FONTS = {
  provider: "fontsource" as WebFontsProviders,
  fonts: {
    sans: [
      {
        name: "Noto Sans",
        weights: [400, 500, 600, 700],
        subsets: ["latin", "latin-ext"],
      },
    ],
    serif: [
      {
        name: "Noto Serif",
        weights: [400, 700],
        subsets: ["latin", "latin-ext"],
      },
    ],
    mono: [
      {
        name: "JetBrains Mono",
        weights: [400, 500, 700],
        subsets: ["latin", "latin-ext"],
      },
    ],
  },
};

const fontUrlRegex = /[-\w@:%+.~#?&/=]+\.(?:woff2?|eot|ttf|otf|svg)/gi;
const urlProtocolRegex = /^[\s\w\0+.-]{2,}:[/\\]{1,2}/;

function getHash(input: string, length = 8) {
  return createHash("sha256").update(input).digest("hex").slice(0, length);
}

function hasProtocol(input: string) {
  return urlProtocolRegex.test(input);
}

function withProtocol(input: string) {
  return input.startsWith("//") ? `https:${input}` : `https://${input}`;
}

/**
 * Creates a local font processor that downloads remote web fonts and caches them locally.
 */
export function createLocalFontProcessor(options?: LocalFontProcessorOptions) {
  const { cacheDir, fontAssetsDir } = resolveFontPaths(options);

  async function _downloadFont(url: string, assetPath: string) {
    let buf: Buffer;
    if (options?.fetch) {
      const res = await options.fetch(url);
      if (res instanceof ArrayBuffer) {
        buf = Buffer.from(res);
      } else if ("arrayBuffer" in res && typeof res.arrayBuffer === "function") {
        buf = Buffer.from(await res.arrayBuffer());
      } else {
        buf = Buffer.from(res as any);
      }
    } else {
      const res = await fetch(url);
      buf = Buffer.from(await res.arrayBuffer());
    }

    const filename = assetPath.split(/[\\/]/).pop()!;
    if (options?.onDownload) {
      await options.onDownload(filename, buf);
    }
    await fsp.mkdir(fontAssetsDir, { recursive: true });
    await fsp.writeFile(assetPath, buf);
  }

  const cache = new Map<string, Promise<void>>();
  function downloadFont(url: string, assetPath: string) {
    if (!cache.has(url)) cache.set(url, _downloadFont(url, assetPath));
    return cache.get(url)!;
  }

  return {
    async getCSS(fonts: any, providers: any, getCSSDefault: any) {
      const hash = getHash(JSON.stringify(fonts));
      const cachePath = join(cacheDir, `${hash}.css`);
      if (fs.existsSync(cachePath)) return fsp.readFile(cachePath, "utf-8");
      const css = await getCSSDefault(fonts, providers);
      await fsp.mkdir(cacheDir, { recursive: true });
      await fsp.writeFile(cachePath, css, "utf-8");
      return css;
    },
    async transformCSS(css: string) {
      const matches = css.match(fontUrlRegex) || [];
      const replacements = new Map<string, string>();
      await Promise.all(
        Array.from(new Set(matches)).map(async (url) => {
          const hash = getHash(url);
          const ext = url.split(".").pop();
          let name = "";
          const match1 = url.match(/\/s\/([^/]+)\//);
          if (match1)
            name = match1[1]!.replace(/\W/g, " ").trim().replace(/\s+/, "-").toLowerCase();
          const filename = `${[name, hash].filter(Boolean).join("-")}.${ext}`;
          const assetPath = join(fontAssetsDir, filename);
          if (!fs.existsSync(assetPath))
            await downloadFont(hasProtocol(url) ? url : withProtocol(url), assetPath);
          replacements.set(url, assetPath.replace(/\\/g, "/"));
        }),
      );
      return css.replace(fontUrlRegex, (match) => replacements.get(match) || match);
    },
  };
}

export type WebFontsProviders =
  | "google"
  | "bunny"
  | "fontshare"
  | "none"
  | "fontsource"
  | (string & {});

export interface WebFontsOptions {
  provider?: WebFontsProviders;
  fonts?: Record<string, any>;
  processors?: any;
  processorOptions?: LocalFontProcessorOptions;
  [key: string]: any;
}

/**
 * Creates the default web fonts preset with local font processing always enabled.
 */
export function resolveWebFontsPreset(options?: WebFontsOptions | boolean) {
  if (options === false) return null;

  const userOpts: WebFontsOptions = typeof options === "object" && options !== null ? options : {};
  const { processors, processorOptions, provider, fonts, ...restPresetOpts } = userOpts;
  const mergedFonts = {
    ...DEFAULT_UI_FONTS.fonts,
    ...fonts,
  };

  const resolvedProcessors = processors ?? [createLocalFontProcessor(processorOptions)];

  return presetWebFonts({
    ...restPresetOpts,
    provider: (provider || DEFAULT_UI_FONTS.provider) as any,
    fonts: mergedFonts,
    processors: Array.isArray(resolvedProcessors) ? resolvedProcessors : [resolvedProcessors],
  });
}
