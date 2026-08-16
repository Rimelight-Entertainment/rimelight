import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./types"
import rimelightUiPreset from "./preset"

const INCLUDES = [
  /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
  /[\\/](@rimelight\/ui|packages\/ui)[\\/]/
]

export const ui = (config: UIConfig = {}): AstroIntegration[] => [
  UnoCSS({
    ...config.unocss,
    presets: [rimelightUiPreset(config), ...(config.unocss?.presets ?? [])],
    content: {
      ...config.unocss?.content,
      pipeline: config.unocss?.content?.pipeline !== false && {
        ...config.unocss?.content?.pipeline,
        include: [...INCLUDES, ...[config.unocss?.content?.pipeline?.include ?? []].flat()]
      }
    }
  }),
  {
    name: "@rimelight/ui",
    hooks: {
      "astro:config:setup": ({ updateConfig }) =>
        void updateConfig({
          vite: { define: { "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify(config) } }
        })
    }
  }
]
