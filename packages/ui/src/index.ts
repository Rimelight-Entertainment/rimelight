import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./types"
import rimelightUiPreset, { getAllColorNames } from "./presets"

const INCLUDES = [
  /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
  /[\\/](@rimelight\/ui|packages\/ui)[\\/]/
]

export function ui(o: UIConfig = {}): AstroIntegration[] {
  const p = o.unocss?.content?.pipeline

  return [
    UnoCSS({
      ...o.unocss,
      presets: [rimelightUiPreset(o), ...(o.unocss?.presets || [])],
      content: {
        ...o.unocss?.content,
        pipeline: p !== false && {
          ...p,
          include: [...INCLUDES, ...(Array.isArray(p?.include) ? p.include : [])]
        }
      }
    }),
    {
      name: "@rimelight/ui",
      hooks: {
        "astro:config:setup": ({ updateConfig }) =>
          void updateConfig({
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
  ]
}

export * from "./types"
export { rimelightUiPreset, colorScales } from "./presets"
export { defineTheme, uiConfig } from "./utils/resolver"
