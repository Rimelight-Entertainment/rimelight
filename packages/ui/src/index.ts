import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./types"
import rimelightUiPreset from "./presets"

const INCLUDES = [
  /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
  /[\\/](@rimelight\/ui|packages\/ui)[\\/]/
]

export const ui = (o: UIConfig = {}): AstroIntegration[] => {
  const p = o.unocss?.content?.pipeline
  return [
    UnoCSS({
      ...o.unocss,
      presets: [rimelightUiPreset(o), ...(o.unocss?.presets ?? [])],
      content: {
        ...o.unocss?.content,
        pipeline: p !== false && {
          ...p,
          include: [...INCLUDES, ...(p?.include ? [p.include].flat() : [])]
        }
      }
    }),
    {
      name: "@rimelight/ui",
      hooks: {
        "astro:config:setup": ({ updateConfig }) =>
          void updateConfig({
            vite: { define: { "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify(o) } }
          })
      }
    }
  ]
}
