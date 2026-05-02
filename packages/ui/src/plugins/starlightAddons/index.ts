import type { StarlightPlugin, } from "@astrojs/starlight/types"
import virtual from "vite-plugin-virtual"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface StarlightAddonsConfig {
  copy?: boolean
  share?: boolean
}

export default function starlightAddons(userConfig?: StarlightAddonsConfig): StarlightPlugin {
  const defaultAddonConfig: StarlightAddonsConfig = {
    copy: true,
    share: true
  }

  const addonConfig = { ...defaultAddonConfig, ...userConfig }

  return {
    name: "rimelight-ui-starlight-addons",
    hooks: {
      "config:setup"({ addIntegration, updateConfig, logger}) {

        if (!addonConfig.copy && !addonConfig.share) {
          logger.warn("StarlightAddons: No features enabled.")
        }

        updateConfig({
          components: {
            PageTitle: path.join(__dirname, "PageTitle.astro")
          }
        })

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
