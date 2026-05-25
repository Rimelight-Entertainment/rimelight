import type { StarlightPlugin } from "@astrojs/starlight/types"
import virtual from "vite-plugin-virtual"
import path from "node:path"
import { fileURLToPath } from "node:url"

const pathDirname = path.dirname(fileURLToPath(import.meta.url))

export interface StarlightAddonsConfig {
  copy?: boolean
  share?: boolean
}

export default function starlightAddons(userConfig?: StarlightAddonsConfig): StarlightPlugin {
  // 1. Setup default and merged config for Addons
  const defaultAddonConfig: StarlightAddonsConfig = {
    copy: true,
    share: true
  }

  const addonConfig = { ...defaultAddonConfig, ...userConfig }

  return {
    name: "rimelight-ui-starlight-addons",
    hooks: {
      "config:setup"({ addIntegration, updateConfig, logger }) {
        // --- Addons Logic ---
        if (!addonConfig.copy && !addonConfig.share) {
          logger.warn("StarlightAddons: No features enabled.")
        }

        updateConfig({
          components: {
            // This will merge with the Sidebar override if both exist
            PageTitle: path.join(pathDirname, "PageTitle.astro")
          }
        })

        // --- Unified Integration ---
        addIntegration({
          name: "rimelight-ui-starlight-addons-integration",
          hooks: {
            "astro:config:setup": ({ updateConfig: updateAstroConfig }) => {
              updateAstroConfig({
                vite: {
                  plugins: [
                    virtual({
                      "virtual:rimelight-starlight-addons-config": `export default ${JSON.stringify(addonConfig)}`
                    })
                  ]
                }
              } as Record<string, unknown>)
            }
          }
        })
      }
    }
  }
}
