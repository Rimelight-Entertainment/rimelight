import UnoCSS from "@unocss/vite"
import type { UIConfig } from "./types"
import rimelightUiPreset from "./preset"

export const ui = (config: UIConfig = {}) => [
  ...UnoCSS({
    ...config.unocss,
    presets: [rimelightUiPreset(config), ...(config.unocss?.presets ?? [])],
    content: {
      ...config.unocss?.content,
      pipeline: config.unocss?.content?.pipeline !== false && {
        ...config.unocss?.content?.pipeline,
        include: [
          /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
          /[\\/](@rimelight\/ui|packages\/ui)[\\/]/,
          ...[config.unocss?.content?.pipeline?.include ?? []].flat()
        ]
      }
    }
  }),
  {
    name: "@rimelight/ui",
    config: () => ({
      define: { "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify(config) }
    })
  }
]
