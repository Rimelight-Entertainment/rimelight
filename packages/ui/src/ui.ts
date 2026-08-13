import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./config"
import { colorConfig } from "./config"
import rimelightUiPreset, { uiFilesystemGlob, uiSrcGlob } from "./presets"
import type { RimelightPresetOptions } from "./presets"

export function ui(options: UIConfig = {}): AstroIntegration[] {
  const { colors = {}, logos = {}, shortcuts = {}, icons = {}, components, unocss = {} } = options

  const presetOptions: RimelightPresetOptions = {
    colors,
    ...(options.autogenerateColorModes !== undefined && {
      autogenerateColorModes: options.autogenerateColorModes
    }),
    ...(options.presets !== undefined && { presets: options.presets })
  }

  const resolvedConfig = {
    ...components?.themes,
    logos,
    colors: [...new Set([...colorConfig.colors, ...Object.keys(colors)])],
    shortcuts,
    icons
  }

  const content = typeof unocss.content === "object" ? unocss.content : undefined
  const pipeline = typeof content?.pipeline === "object" ? content.pipeline : undefined

  return [
    UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(presetOptions), ...(unocss.presets ?? [])],
      safelist: [
        ...Object.values(icons).filter(
          (v): v is string => typeof v === "string" && v.startsWith("i-")
        ),
        ...(unocss.safelist ?? [])
      ],
      content: {
        pipeline: {
          include: [
            /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
            "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
            uiSrcGlob,
            ...extractList(
              pipeline?.include,
              (i): i is string | RegExp => typeof i === "string" || i instanceof RegExp
            )
          ]
        },
        filesystem: [
          uiFilesystemGlob,
          ...extractList(content?.filesystem, (i): i is string => typeof i === "string")
        ]
      }
    }),
    {
      name: "@rimelight/ui",
      hooks: {
        "astro:config:setup": ({ updateConfig, logger }) => {
          logger.info("Initializing @rimelight/ui core")
          updateConfig({
            vite: {
              define: {
                "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify(resolvedConfig)
              }
            }
          })
        }
      }
    }
  ]
}

function extractList<T>(value: unknown, guard: (item: unknown) => item is T): T[] {
  if (!value) return []
  return (Array.isArray(value) ? value : [value]).filter(guard)
}
