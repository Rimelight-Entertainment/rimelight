import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./config"
import { getAllColorNames } from "./config"
import rimelightUiPreset, { uiSrcGlob } from "./presets"

export function ui(o: UIConfig = {}): AstroIntegration[] {
  const { colors = {}, logos = {}, shortcuts = {}, icons = {}, components, unocss = {} } = o
  const userContent = (unocss.content ?? {}) as Record<string, any>

  const defineUiConfig = JSON.stringify({
    unstyled: o.unstyled,
    themes: components?.themes ?? {},
    props: components?.props ?? {},
    logos,
    colors: getAllColorNames(colors),
    shortcuts,
    icons
  })

  return [
    UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(o), ...(unocss.presets ?? [])],
      content: {
        ...userContent,
        pipeline: {
          ...userContent.pipeline,
          include: [
            /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
            uiSrcGlob,
            ...(Array.isArray(userContent.pipeline?.include) ? userContent.pipeline.include : [])
          ]
        },
        filesystem: [
          uiSrcGlob,
          ...(Array.isArray(userContent.filesystem) ? userContent.filesystem : [])
        ]
      }
    }),
    {
      name: "@rimelight/ui",
      hooks: {
        "astro:config:setup": ({ updateConfig }) => {
          updateConfig({
            vite: { define: { "import.meta.env.RIMELIGHT_UI_CONFIG": defineUiConfig } }
          })
        }
      }
    }
  ]
}
