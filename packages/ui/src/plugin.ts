import UnoCSS from "@unocss/vite"
import rimelightUiPreset from "./preset"
import type { UIConfig } from "./types"

const ID = "virtual:rimelight/ui"

export interface RimelightUIPlugin {
  name: string
  enforce?: "pre" | "post"
  resolveId?: (id: string) => string | null | undefined
  load?: (id: string) => string | null | undefined
  [key: string]: any
}

export type RimelightUIPlugins = (RimelightUIPlugin | RimelightUIPlugin[])[]

export const ui = ({ unocss = {}, ...cfg }: UIConfig = {}): RimelightUIPlugins => [
  ...(UnoCSS({
    ...unocss,
    presets: [rimelightUiPreset(cfg), ...(unocss.presets || [])],
    content: {
      ...unocss.content,
      pipeline: unocss.content?.pipeline !== false && {
        ...unocss.content?.pipeline,
        include: [
          /\.(svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
          /[\\/](@rimelight\/(ui|cms)|packages\/(ui|cms))[\\/]/,
          ...[unocss.content?.pipeline?.include]
            .flat()
            .filter((v): v is string | RegExp => Boolean(v))
        ]
      }
    }
  }) as RimelightUIPlugin[]),
  {
    name: "rimelight/ui",
    enforce: "pre",
    resolveId: (id: string) => (id === ID ? `\0${ID}` : null),
    load: (id: string) => (id === `\0${ID}` ? `export default ${JSON.stringify(cfg)};` : null)
  }
]

export default ui
