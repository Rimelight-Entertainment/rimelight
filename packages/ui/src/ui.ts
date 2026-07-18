import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import { merge } from "./utils/merge"
import { defaultUIConfig } from "./themes"
import { type UIOptions, coreColors } from "./config"
import rimelightUiPreset, { uiSrcGlob, uiFilesystemGlob } from "./presets"
import type { RimelightPresetOptions } from "./presets"

export type { UIOptions, UIConfigOverrides, RimelightIcons, CategoryConfig } from "./config"

export function ui(options: UIOptions = {}): AstroIntegration[] {
  let astroLogger: any = null

  const presetOptions: RimelightPresetOptions = {
    colors: options.colors ?? {},
    ...(options.autogenerateColorModes !== undefined && {
      autogenerateColorModes: options.autogenerateColorModes
    }),
    ...(options.unocss?.presets !== undefined && {
      presets: options.unocss.presets
    })
  }

  const resolvedConfig = {
    ...merge(options.components?.themes ?? {}, defaultUIConfig),
    logos: options.logos ?? {},
    colors: Array.from(new Set([...coreColors, ...Object.keys(options.colors ?? {})])),
    shortcuts: options.shortcuts ?? {},
    icons: options.icons ?? {}
  }

  return [
    UnoCSS({
      presets: [rimelightUiPreset(presetOptions)],
      safelist: Object.values(options.icons ?? {}).filter(
        (v): v is string => typeof v === "string" && v.startsWith("i-")
      ),
      content: {
        pipeline: {
          include: [
            /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
            "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
            uiSrcGlob
          ]
        },
        filesystem: [uiFilesystemGlob, "src/components/**/*", "src/pages/**/*"]
      },
      configResolved(config) {
        logUnoConfig(config, astroLogger)
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
