import UnoCSS from "@unocss/vite"
import rimelightUiPreset from "./preset"
import type { UIConfig } from "./types"

const ID = "virtual:rimelight/ui"
const RESOLVED_ID = `\0${ID}`

export const ui = ({ unocss = {}, ...cfg }: UIConfig = {}) => [
  ...UnoCSS({
    ...unocss,
    presets: [rimelightUiPreset(cfg), ...(unocss.presets || [])],
    content: {
      ...unocss.content,
      pipeline: unocss.content?.pipeline !== false && {
        ...unocss.content?.pipeline,
        include: [
          /\.(vue|svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
          /[\\/](@rimelight\/ui|packages\/ui)[\\/]/,
          ...[unocss.content?.pipeline?.include || []].flat()
        ]
      }
    }
  }),
  {
    name: "rimelight/ui",
    resolveId: (id: string) => (id === ID || id === "rimelight/ui" ? RESOLVED_ID : null),
    load: (id: string) =>
      id === RESOLVED_ID
        ? `import "virtual:uno.css";\nexport default ${JSON.stringify(cfg)};`
        : null
  }
]
