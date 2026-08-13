import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./config"
import { colorConfig } from "./config"
import rimelightUiPreset, { uiFilesystemGlob, uiSrcGlob } from "./presets"
import type { RimelightPresetOptions } from "./presets"

export function ui(options: UIConfig = {}): AstroIntegration[] {
  const presetOptions: RimelightPresetOptions = {
    colors: options.colors ?? {},
    ...(options.autogenerateColorModes !== undefined && {
      autogenerateColorModes: options.autogenerateColorModes
    }),
    ...(options.presets !== undefined && { presets: options.presets })
  }

  const resolvedConfig = {
    ...options.components?.themes,
    logos: options.logos ?? {},
    colors: Array.from(new Set([...colorConfig.colors, ...Object.keys(options.colors ?? {})])),
    shortcuts: options.shortcuts ?? {},
    icons: options.icons ?? {}
  }

  const userUnoConfig = options.unocss ?? {}

  return [
    UnoCSS({
      ...userUnoConfig,
      presets: [rimelightUiPreset(presetOptions), ...(userUnoConfig.presets ?? [])],
      safelist: [
        ...Object.values(options.icons ?? {}).filter(
          (v): v is string => typeof v === "string" && v.startsWith("i-")
        ),
        ...(userUnoConfig.safelist ?? [])
      ],
      content: {
        pipeline: {
          include: [
            /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
            "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
            uiSrcGlob,
            ...extractPipelineIncludes(userUnoConfig.content)
          ]
        },
        filesystem: [uiFilesystemGlob, ...extractFilesystemGlobs(userUnoConfig.content)]
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

function extractPipelineIncludes(content: any): (string | RegExp)[] {
  const include = content?.pipeline?.include
  if (!include) return []
  return (Array.isArray(include) ? include : [include]).filter(
    (item): item is string | RegExp => typeof item === "string" || item instanceof RegExp
  )
}

function extractFilesystemGlobs(content: any): string[] {
  const filesystem = content?.filesystem
  if (!filesystem) return []
  return (Array.isArray(filesystem) ? filesystem : [filesystem]).filter(
    (item): item is string => typeof item === "string"
  )
}
