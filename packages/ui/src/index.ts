import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./types"
import rimelightUiPreset, { getAllColorNames } from "./presets"

const INCLUDES = [
  /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
  /[\\/](@rimelight\/ui|packages\/ui)[\\/]/
]

const resolvePipeline = (p: any) =>
  p !== false && { ...p, include: [...INCLUDES, ...(Array.isArray(p?.include) ? p.include : [])] }

export function ui({ unocss, ...o }: UIConfig = {}): AstroIntegration[] {
  return [
    UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(o), ...(unocss?.presets || [])],
      content: { ...unocss?.content, pipeline: resolvePipeline(unocss?.content?.pipeline) }
    }),
    {
      name: "@rimelight/ui",
      hooks: {
        "astro:config:setup": ({ updateConfig }) =>
          void updateConfig({
            vite: {
              define: {
                "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify({
                  ...o,
                  themes: o.components?.themes,
                  colors: getAllColorNames(o.colors)
                })
              }
            }
          })
      }
    }
  ]
}
