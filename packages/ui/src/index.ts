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
    name: "rimelight/ui",
    resolveId: (id: string) =>
      id === "virtual:rimelight/ui" || id === "rimelight/ui" ? "\0virtual:rimelight/ui" : null,
    load: (id: string) =>
      id === "\0virtual:rimelight/ui" ? `export default ${JSON.stringify(config)}` : null
  }
]
