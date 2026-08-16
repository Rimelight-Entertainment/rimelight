import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./types"
import rimelightUiPreset, { getAllColorNames } from "./presets"

export function ui(o: UIConfig = {}): AstroIntegration[] {
  const { pipeline, ...userContent } = o.unocss?.content ?? {}
  const include = [
    /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
    /[\\/](@rimelight\/ui|packages\/ui)[\\/]/,
    ...(typeof pipeline === "object" && Array.isArray(pipeline?.include) ? pipeline.include : [])
  ]

  return [
    UnoCSS({
      ...o.unocss,
      presets: [rimelightUiPreset(o), ...(o.unocss?.presets ?? [])],
      content: { ...userContent, pipeline: pipeline === false ? false : { ...pipeline, include } }
    }),
    {
      name: "@rimelight/ui",
      hooks: {
        "astro:config:setup": ({ updateConfig }) => {
          updateConfig({
            vite: {
              define: {
                "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify({
                  unstyled: o.unstyled,
                  themes: o.components?.themes,
                  logos: o.logos,
                  colors: getAllColorNames(o.colors),
                  shortcuts: o.shortcuts,
                  icons: o.icons
                })
              }
            }
          })
        }
      }
    }
  ]
}

export * from "./types"
export { rimelightUiPreset, colorScales } from "./presets"
export { defineTheme, uiConfig } from "./utils/resolver"
