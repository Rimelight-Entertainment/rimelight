import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import vue from "@astrojs/vue"
import defu from "defu"
import { defaultUIConfig } from "../themes"
import type { ComponentTheme } from "../utils/defineTheme"
import rimelightUiPreset, {
  uiSrcGlob,
  uiFilesystemGlob,
  type ColorConfigValue,
  type RimelightPresetOptions
} from "../presets"

/**
 * Shape of the `ui` config that can be passed to the integration.
 */
export type UIConfigOverrides = Record<string, Partial<ComponentTheme>>

export interface UIOptions {
  /**
   * Configuration for the Logo component variants.
   */
  logos?: Record<
    string,
    | string
    | {
        light?: string
        dark?: string
        color?: string
        white?: string
        black?: string
        [key: string]: string | undefined
      }
  >
  /**
   * Global UI overrides applied to all components. Merged with defaults via `defu` (first arg
   * wins).
   */
  ui?: UIConfigOverrides
  /**
   * Custom colors. Each color can be:
   *
   * - **Flat format**: `{ "500": "#7146ff", "600": "#6222ff" }` — used in all modes. No mode-specific
   *   buckets needed.
   * - **Mode format**: flat shades at root define the base; `light`, `dark`, `flat` buckets layer on
   *   top:
   *
   *   ```ts
   *   { "500": "base", light: { "600": "light-blue" }, dark: { "500": "dark-blue" } }
   *   ```
   *
   *   Each shade falls back through: **mode bucket → flat → unthemed → light → dark**. Defining a
   *   single source (e.g. only `dark`) propagates to all modes.
   *
   *   Use the `theme` prop on components to pin colors: `<Button theme="flat">` forces the flat
   *   bucket regardless of current mode.
   */
  colors?: Record<
    string,
    | Record<string, string>
    | {
        light?: Record<string, string>
        dark?: Record<string, string>
        flat?: Record<string, string>
      }
  >
  /**
   * When `true`, auto-generates missing `light`/`dark` mode buckets from flat color values using
   * `color-mix(in oklch, ...)`. Explicitly provided buckets always take precedence. Defaults to
   * `true`.
   */
  autogenerateColorModes?: boolean
}

/**
 * Astro integration for `@rimelight/ui`.
 *
 * Provides global UI configuration via a virtual module. Components import `virtual:rimelight-ui`
 * to access the merged config.
 *
 * @example
 *   // astro.config.mjs
 *   import { ui } from "@rimelight/ui/integrations"
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
  const resolvedUI = defu(options.ui ?? {}, defaultUIConfig)
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
    colors: mergedColors
  }

  const virtualModuleId = "virtual:rimelight-ui"
  const resolvedVirtualModuleId = "\0" + virtualModuleId

  function setViteConfig(updateConfig: (config: Record<string, unknown>) => void) {
    updateConfig({
      vite: {
        optimizeDeps: {
          exclude: ["@rimelight/ui"]
        },
        ssr: {
          noExternal: ["@rimelight/ui"]
        },
        plugins: [
          {
            name: "vite-plugin-rimelight-ui-config",
            enforce: "pre",
            resolveId(id: string) {
              if (id === virtualModuleId) return resolvedVirtualModuleId
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
      "astro:config:setup": ({ updateConfig, logger }) => {
        logger.info("Initializing @rimelight/ui core")
        setViteConfig(updateConfig)
      }
    }
  }

  return [
    UnoCSS({
      presets: [rimelightUiPreset(presetOptions)],
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
