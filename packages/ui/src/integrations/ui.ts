import type { AstroIntegration } from "astro"
import defu from "defu"
import { defaultUIConfig } from "../themes"

/**
 * Shape of the `ui` config that can be passed to the integration. Keys are component names, values
 * are partial theme configs.
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
export function ui(options: UIOptions = {}): AstroIntegration {
  // Merge user overrides with defaults (user-provided values win)
  const resolvedConfig = defu(options.ui ?? {}, defaultUIConfig)

  const virtualModuleId = "virtual:rimelight-ui"
  const resolvedVirtualModuleId = "\0" + virtualModuleId

  return {
    name: "@rimelight/ui",
    hooks: {
      "astro:config:setup": ({ updateConfig, logger }) => {
        logger.info("Initializing @rimelight/ui configuration")

        updateConfig({
          vite: {
            plugins: [
              {
                name: "vite-plugin-rimelight-ui-config",
                enforce: "pre",
                resolveId(id: string) {
                  if (id === virtualModuleId) {
                    return resolvedVirtualModuleId
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
    }
  }
}
