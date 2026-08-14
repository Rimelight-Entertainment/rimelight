import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./config"
import { colorConfig } from "./config"
import rimelightUiPreset, { uiFilesystemGlob, uiSrcGlob } from "./presets"

export function ui(o: UIConfig = {}): AstroIntegration[] {
  const { colors = {}, logos = {}, shortcuts = {}, icons = {}, components, unocss = {} } = o
  const userContent = (typeof unocss.content === "object" ? unocss.content : {}) as Record<
    string,
    any
  >

  return [
    UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(o), ...(unocss.presets ?? [])],
      content: {
        ...userContent,
        pipeline: {
          include: [
            /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
            "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
            uiSrcGlob,
            ...(Array.isArray(userContent.pipeline?.include) ? userContent.pipeline.include : [])
          ]
        },
        filesystem: [
          uiFilesystemGlob,
          ...(Array.isArray(userContent.filesystem) ? userContent.filesystem : [])
        ]
      }
    }),
    {
      name: "@rimelight/ui",
      hooks: {
        "astro:config:setup": ({ updateConfig }) => {
          updateConfig({
            vite: {
              define: {
                "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify({
                  ...components?.themes,
                  logos,
                  colors: Array.from(new Set([...colorConfig.colors, ...Object.keys(colors)])),
                  shortcuts,
                  icons
                })
              }
            }
          })
        }
      }
    }
  ]
}
