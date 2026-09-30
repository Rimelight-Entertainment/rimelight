import type { SecurityOptions, ConstructionOptions } from "./types";
import { security } from "./vite";

export interface RimelightSecurityOptions extends SecurityOptions {
  /**
   * Construction mode options & route injection settings
   */
  construction?: ConstructionOptions & {
    /**
     * Optional custom route pattern. Defaults to "/[locale]/construction".
     */
    routePattern?: string;
    /**
     * Optional custom page entrypoint to inject.
     */
    entrypoint?: string;
  };
}

/**
 * Astro Integration for Rimelight Security. Integrates Vite security plugins (CSP, SRI).
 */
export function rimelightSecurity(options: RimelightSecurityOptions = {}): any {
  return {
    name: "@rimelight/security",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig }: any) => {
        // 1. Inject custom construction route if an entrypoint is provided
        if (options.construction?.entrypoint) {
          const pattern = options.construction?.routePattern || "/[locale]/construction";
          injectRoute({
            pattern,
            entrypoint: options.construction.entrypoint
          });
        }

        // 2. Add Vite security plugin
        updateConfig({
          vite: {
            plugins: [security(options)]
          }
        });
      }
    }
  };
}

export default rimelightSecurity;
