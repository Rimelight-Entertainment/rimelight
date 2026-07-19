import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import { merge } from "./utils/merge"
import { uiConfig } from "./themes"
import type { UIConfig } from "./config/ui.config"
import { colorConfig } from "./config/color.config"
import rimelightUiPreset, { uiSrcGlob, uiFilesystemGlob } from "./presets"
import type { RimelightPresetOptions } from "./presets"

export type { UIConfig } from "./config/ui.config"
export type { RimelightIcons } from "./icons/defaults"
export { defineTheme } from "./themes"

export function ui(options: UIConfig = {}): AstroIntegration[] {
  let astroLogger: any = null

  const presetOptions: RimelightPresetOptions = {
    colors: options.colors ?? {},
    ...(options.autogenerateColorModes !== undefined && {
      autogenerateColorModes: options.autogenerateColorModes
    }),
    ...(options.presets !== undefined && {
      presets: options.presets
    })
  }

  const resolvedConfig = {
    ...merge(options.components?.themes ?? {}, uiConfig),
    logos: options.logos ?? {},
    colors: Array.from(new Set([...colorConfig.colors, ...Object.keys(options.colors ?? {})])),
    shortcuts: options.shortcuts ?? {},
    icons: options.icons ?? {}
  }

  const userUnoConfig = options.unocss ?? {}

  const contentObj = typeof userUnoConfig.content === "object" ? userUnoConfig.content : null
  const rawIncludes = (contentObj as any)?.pipeline?.include
  const userPipelineIncludes: (string | RegExp)[] = rawIncludes
    ? ([rawIncludes].flat() as (string | RegExp)[])
    : []
  const rawFilesystem = (contentObj as any)?.filesystem
  const userFilesystem: string[] = rawFilesystem ? ([rawFilesystem].flat() as string[]) : []

  return [
    UnoCSS({
      ...userUnoConfig,
      presets: [rimelightUiPreset(presetOptions), ...(userUnoConfig.presets ?? [])],
      safelist: [
        ...Object.values(options.icons ?? {}).filter(
          (v): v is string => typeof v === "string" && v.startsWith("i-")
        ),
        ...(userUnoConfig.safelist ?? [])
      ],
      content: {
        pipeline: {
          include: [
            /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
            "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
            uiSrcGlob,
            ...userPipelineIncludes
          ]
        },
        filesystem: [uiFilesystemGlob, "src/components/**/*", "src/pages/**/*", ...userFilesystem]
      },
      configResolved(config) {
        logUnoConfig(config, astroLogger)
        userUnoConfig.configResolved?.(config)
      }
    }),
    {
      name: "@rimelight/ui",
      hooks: {
        "astro:config:setup": ({ updateConfig, logger }) => {
          astroLogger = logger
          logger.info("Initializing @rimelight/ui core")
          updateConfig({
            vite: {
              plugins: [createVirtualModulePlugin(resolvedConfig)]
            }
          })
        }
      }
    }
  ]
}

/**
 * Creates a Vite plugin to resolve and load the virtual config module.
 */
function createVirtualModulePlugin(config: any) {
  const id = "virtual:rimelight-ui"
  return {
    name: "vite-plugin-rimelight-ui-virtual",
    enforce: "pre" as const,
    resolveId: (rId: string) => (rId === id ? "\0" + id : null),
    load: (rId: string) =>
      rId === "\0" + id
        ? `const _config = ${JSON.stringify(config)}; export const getUIConfig = () => _config;`
        : null
  }
}

/**
 * Helper to log UnoCSS configuration details and rule collisions in development.
 */
function logUnoConfig(config: any, astroLogger: any) {
  if (process.env.NODE_ENV !== "development" || process.env.UNO_CONFIG_LOGGED) {
    return
  }
  process.env.UNO_CONFIG_LOGGED = "true"

  const log = (msg: string, isWarn = false) => {
    const logger = astroLogger ?? console
    const method = isWarn ? "warn" : astroLogger ? "info" : "log"
    logger[method](msg)
  }

  log(`[UnoCSS] Presets: ${config.presets.map((p: any) => p.name).join(", ")}`)
  log(`[UnoCSS] Rules: ${config.rules.length}`)
  log(`[UnoCSS] Shortcuts: ${Object.keys(config.shortcuts).length}`)

  const ruleNames = config.rules.map((r: any) => (Array.isArray(r) ? r[0].toString() : "dynamic"))
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const name of ruleNames) {
    if (seen.has(name)) {
      duplicates.add(name)
    } else {
      seen.add(name)
    }
  }
  const filtered = Array.from(duplicates).filter((d: string) => d !== "/^(.+?)-(\\$.+)$/")

  if (filtered.length > 0) {
    log(`[UnoCSS] Rule collisions: ${filtered.join(", ")}`, true)
  }
}
