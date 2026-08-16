import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { FilterPattern } from "unocss"
import type { UIConfig } from "./types"
import rimelightUiPreset from "./presets"

const INCLUDES = [
  /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
  /[\\/](@rimelight\/ui|packages\/ui)[\\/]/
]

const resolvePipeline = (p?: { include?: FilterPattern; exclude?: FilterPattern } | false) =>
  p !== false && {
    ...p,
    include: [...INCLUDES, ...(p?.include ? [p.include].flat() : [])]
  }

export const ui = (o: UIConfig = {}): AstroIntegration[] => [
  UnoCSS({
    ...o.unocss,
    presets: [rimelightUiPreset(o), ...(o.unocss?.presets ?? [])],
    content: { ...o.unocss?.content, pipeline: resolvePipeline(o.unocss?.content?.pipeline) }
  }),
  {
    name: "@rimelight/ui",
    hooks: {
      "astro:config:setup": ({ updateConfig }) =>
        void updateConfig({
          vite: {
            define: {
              "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify(o)
            }
          }
        })
    }
  }
]
