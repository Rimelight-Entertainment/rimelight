import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import vue from "@astrojs/vue"
import uiPlugin from "@nuxt/ui/vite"
import defu from "defu"
import tailwindcss from "@tailwindcss/vite"
import { defaultUIConfig } from "../themes"
import type { ComponentTheme } from "../utils/defineTheme"

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
  const resolvedConfig = { ...resolvedUI, logos: options.logos ?? {} }

  const virtualModuleId = "virtual:rimelight-ui"
  const resolvedVirtualModuleId = "\0" + virtualModuleId

  function setViteConfig(updateConfig: (config: Record<string, unknown>) => void) {
    updateConfig({
      vite: {
        optimizeDeps: {
          exclude: [
            "@rimelight/ui",
            "@rimelight/ui/vue-plugin",
            "@rimelight/ui/integrations/vue-entrypoint",
            "@nuxt/ui"
          ]
        },
        ssr: {
          noExternal: ["@rimelight/ui", "@nuxt/ui"],
          optimizeDeps: {
            exclude: ["@rimelight/ui/vue-plugin", "@rimelight/ui/integrations/vue-entrypoint"]
          }
        },
        plugins: [
          uiPlugin({
            router: false,
            scanPackages: ["@rimelight/ui"]
          }),
          tailwindcss(),
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
    UnoCSS(),
    vue({
      appEntrypoint: "@rimelight/ui/integrations/vue-entrypoint"
    }),
    rimelightUIIntegration
  ]
}
