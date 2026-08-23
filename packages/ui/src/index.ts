import UnoCSS from "@unocss/vite"
import rimelightUiPreset from "./preset"
import type { UIConfig } from "./types"

const ID = "virtual:rimelight/ui"

export const ui = ({ unocss = {}, ...cfg }: UIConfig = {}) => [
  UnoCSS({
    ...unocss,
    presets: [rimelightUiPreset(cfg), ...(unocss.presets || [])],
    content: {
      ...unocss.content,
      pipeline: unocss.content?.pipeline !== false && {
        ...unocss.content?.pipeline,
        include: [
          /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
          /[\\/](@rimelight\/(ui|cms)|packages\/(ui|cms))[\\/]/,
          ...[unocss.content?.pipeline?.include]
            .flat()
            .filter((v): v is string | RegExp => Boolean(v))
        ]
      }
    }
  }),
  {
    name: "rimelight/ui",
    enforce: "pre",
    resolveId: (id: string) => (id === ID ? `\0${ID}` : null),
    load: (id: string) =>
      id === `\0${ID}` ? `import "virtual:uno.css";\nexport default ${JSON.stringify(cfg)};` : null
  }
]
