import { defineConfig } from "astro/config"
import { extractAllMeta } from "./src/docs/extractAll"
import { rimelightAstroConfig } from "@rimelight/config/astro"

function localDocsIntegration() {
  return {
    name: "rimelight-docs-integration",
    hooks: {
      "astro:config:setup": async ({
        updateConfig,
        logger
      }: {
        updateConfig: (config: any) => void
        logger: any
      }) => {
        logger.info("Extracting documentation metadata from @rimelight/ui components...")
        const startTime = Date.now()
        const docsMeta = await extractAllMeta()
        logger.info(
          `Documentation metadata extracted in ${((Date.now() - startTime) / 1000).toFixed(2)}s`
        )
        updateConfig({
          vite: {
            plugins: [
              {
                name: "vite-plugin-rimelight-ui-docs-meta",
                enforce: "pre",
                resolveId(id: string) {
                  if (id === "virtual:rimelight-ui-docs-meta") {
                    return "\0" + id
                  }
                  return null
                },
                load(id: string) {
                  if (id === "\0virtual:rimelight-ui-docs-meta") {
                    return `export default ${JSON.stringify(docsMeta)}`
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

export default defineConfig(
  rimelightAstroConfig({
    domain: "rimelight.com",
    seo: true,
    solid: true,
    cms: true,
    security: {
      imgSrc: ["https://s.gravatar.com", "https://cdn.auth0.com", "https://i1.wp.com"]
    },
    i18n: true,
    ui: true,
    integrations: [localDocsIntegration()]
  })
)
