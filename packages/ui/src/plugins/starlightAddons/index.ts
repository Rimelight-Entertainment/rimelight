import type { StarlightPlugin } from "@astrojs/starlight/types"
import virtual from "vite-plugin-virtual"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface StarlightAddonsConfig {
  copy?: boolean
  share?: boolean
}

export default function starlightAddons(userConfig?: StarlightAddonsConfig): StarlightPlugin {
  const defaultConfig: StarlightAddonsConfig = {
    copy: true,
    share: true
  }

  const config: StarlightAddonsConfig = {
    ...defaultConfig,
    ...userConfig
  }

  return {
    name: "rimelight-ui-starlight-addons",
    hooks: {
      "config:setup"({ addIntegration, updateConfig, logger }) {
        if (!config.copy && !config.share) {
          logger.warn("StarlightAddons: Nothing enabled.")
        }

        addIntegration({
          name: "rimelight-ui-starlight-addons-integration",
          hooks: {
            "astro:config:setup": ({ updateConfig: updateAstroConfig }) => {
              updateAstroConfig({
                vite: {
                  plugins: [
                    virtual({
                      "virtual:rimelight-starlight-addons-config": `export default ${JSON.stringify(config)}`
                    })
                  ]
                }
              } as Record<string, unknown>)
            }
          }
        })

        updateConfig({
          components: {
            PageTitle: path.join(__dirname, "PageTitle.astro")
          }
        })
      }
    }
  }
}
