import type { AstroIntegration } from "astro"
import vue from "@astrojs/vue"
import uiPlugin from "@nuxt/ui/vite"
import defu from "defu"
import Icons from "unplugin-icons/vite"
import tailwindcss from '@tailwindcss/vite'
import { defaultUIConfig } from "../themes"

/**
 * Shape of the `ui` config that can be passed to the integration.
 */
export type UIConfigOverrides = {
  button?: Partial<(typeof defaultUIConfig)["button"]>
  header?: Partial<(typeof defaultUIConfig)["header"]>
}

export interface UIOptions {
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
  const resolvedConfig = defu(options.ui ?? {}, defaultUIConfig)

  const virtualModuleId = "virtual:rimelight-ui"
  const resolvedVirtualModuleId = "\0" + virtualModuleId

  const rimelightUIIntegration: AstroIntegration = {
    name: "@rimelight/ui",
    hooks: {
      "astro:config:setup": ({ updateConfig, logger }) => {
        logger.info("Initializing @rimelight/ui core")

        updateConfig({
          vite: {
            plugins: [
              uiPlugin({
                router: false,
                scanPackages: ["@rimelight/ui"]
              }),
              Icons({
                compiler: "astro",
                autoInstall: true
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
    }
  }

  return [
    vue({
      appEntrypoint: "@rimelight/ui/integrations/vue-entrypoint"
    }),
    rimelightUIIntegration
  ]
}
