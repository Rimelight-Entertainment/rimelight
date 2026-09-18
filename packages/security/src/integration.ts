import type { AstroIntegration } from "astro"
import type { SecurityOptions, ConstructionOptions } from "./types"
import { security } from "./vite"

export interface RimelightSecurityOptions extends SecurityOptions {
  /**
   * Construction mode options & route injection settings
   */
  construction?: ConstructionOptions & {
    /**
     * Whether to automatically inject the construction page route. Defaults to true.
     */
    injectRoute?: boolean
    /**
     * Pattern to inject for the construction route. Defaults to "/[locale]/construction" or
     * "/construction".
     */
    routePattern?: string
  }
}

/**
 * Astro Integration for Rimelight Security. Integrates Vite security plugins (CSP, SRI) and
 * automatically injects the construction mode page route.
 */
export function rimelightSecurity(options: RimelightSecurityOptions = {}): AstroIntegration {
  return {
    name: "@rimelight/security",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig }) => {
        // 1. Inject Construction Page Route by default (unless explicitly disabled)
        if (options.construction?.injectRoute !== false) {
          const pattern = options.construction?.routePattern || "/[locale]/construction"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/security/pages/construction.astro"
          })
        }

        // 2. Add Vite security plugin
        updateConfig({
          vite: {
            plugins: [security(options)]
          }
        })
      }
    }
  }
}

export default rimelightSecurity
