import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import vue from "@astrojs/vue"
import { merge } from "../utils/merge"
import { defaultUIConfig } from "../themes"
import type { UIOptions } from "../config"
import rimelightUiPreset, {
  uiSrcGlob,
  uiFilesystemGlob,
  type ColorConfigValue,
  type RimelightPresetOptions
} from "../presets"

export type { UIOptions, UIConfigOverrides, RimelightIcons, CategoryConfig } from "../config"

/**
 * Astro integration for `@rimelight/ui`.
 *
 * Provides global UI configuration via a virtual module. Components import `virtual:rimelight-ui`
 * to access the merged config.
 *
 * @example
 *   // astro.config.mjs
 *   import { ui } from "@rimelight/ui"
 *
 *   export default defineConfig({
 *     integrations: [
 *       ui({
 *         ui: {
 *           button: {
 *             defaultVariants: { variant: "primary" }
 *           }
 *         }
 *       })
 *     ]
 *   })
 */
export function ui(options: UIOptions = {}): AstroIntegration[] {
  const resolvedUI = merge(options.ui ?? {}, defaultUIConfig)
  const coreColors = [
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "commentary",
    "ideation",
    "source"
  ]
  const userColors = (options.colors ?? {}) as Record<string, ColorConfigValue>
  const userColorNames = Object.keys(userColors)
  const mergedColors = [...new Set([...coreColors, ...userColorNames])]
  const presetOptions: RimelightPresetOptions = {
    colors: userColors
  }
  if (options.autogenerateColorModes !== undefined) {
    presetOptions.autogenerateColorModes = options.autogenerateColorModes
  }
  const resolvedConfig = {
    ...resolvedUI,
    logos: options.logos ?? {},
    colors: mergedColors,
    shortcuts: options.shortcuts ?? {},
    icons: options.icons ?? {}
  }

  const virtualModuleId = "virtual:rimelight-ui"
  const resolvedVirtualModuleId = "\0" + virtualModuleId

  async function setViteConfig(updateConfig: (config: Record<string, unknown>) => void) {
    updateConfig({
      vite: {
        plugins: [
          {
            name: "vite-plugin-rimelight-ui-virtual",
            enforce: "pre",
            resolveId(id: string) {
              if (id === virtualModuleId) {
                return "\0" + id
              }
              return null
            },
            load(id: string) {
              if (id === resolvedVirtualModuleId) {
                return `export const getUIConfig = () => (${JSON.stringify(resolvedConfig)});`
              }
              return null
            }
          }
        ]
      }
    })
  }

  const rimelightUIIntegration: AstroIntegration = {
    name: "@rimelight/ui",
    hooks: {
      "astro:config:setup": async ({ updateConfig, logger }) => {
        logger.info("Initializing @rimelight/ui core")
        await setViteConfig(updateConfig)
      }
    }
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
            uiSrcGlob,
            "../ui/src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}"
          ]
        },
        filesystem: [uiFilesystemGlob, "../ui/src/**/*", "src/components/**/*", "src/pages/**/*"]
      },
      configResolved(config) {
        if (process.env.NODE_ENV === "development" && !process.env.UNO_CONFIG_LOGGED) {
          process.env.UNO_CONFIG_LOGGED = "true"
          console.log(`[UnoCSS] Presets: ${config.presets.map((p) => p.name).join(", ")}`)
          console.log(`[UnoCSS] Rules: ${config.rules.length}`)
          console.log(`[UnoCSS] Shortcuts: ${Object.keys(config.shortcuts).length}`)
          const ruleNames = config.rules.map((r) =>
            Array.isArray(r) ? r[0].toString() : "dynamic"
          )
          const duplicates = ruleNames.filter((item, index) => ruleNames.indexOf(item) !== index)
          const filtered = duplicates.filter((d) => d !== "/^(.+?)-(\\$.+)$/")
          if (filtered.length > 0) console.warn(`[UnoCSS] Rule collisions: ${filtered.join(", ")}`)
        }
      }
    }),
    vue(),
    rimelightUIIntegration
  ]
}
