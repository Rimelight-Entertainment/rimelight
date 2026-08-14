import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./config"
import { getAllColorNames } from "./config"
import rimelightUiPreset, { uiSrcGlob } from "./presets"

const EXT_RE = /\.(vue|svelte|[jt]sx|mdx?|astro|html)($|\?)/

export function ui(o: UIConfig = {}): AstroIntegration[] {
  const { colors = {}, logos = {}, shortcuts = {}, icons = {}, components, unocss = {} } = o
  const userContent = unocss.content ?? {}
  const pipeline = userContent.pipeline
  const userInc =
    typeof pipeline === "object" && Array.isArray(pipeline?.include) ? pipeline.include : []
  const include = [EXT_RE, uiSrcGlob, ...userInc]

  const defineUiConfig = JSON.stringify({
    unstyled: o.unstyled,
    themes: components?.themes ?? {},
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
        pipeline: pipeline === false ? false : { ...pipeline, include },
        filesystem: Array.isArray(userContent.filesystem) ? userContent.filesystem : []
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
