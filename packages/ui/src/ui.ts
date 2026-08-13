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
    ...(options.presets !== undefined && {
      presets: options.presets
    })
  }

  const resolvedConfig = {
    ...options.components?.themes,
    logos: options.logos ?? {},
    colors: Array.from(new Set([...colorConfig.colors, ...Object.keys(options.colors ?? {})])),
    shortcuts: options.shortcuts ?? {},
    icons: options.icons ?? {}
  }

  const userUnoConfig = options.unocss ?? {}
  const contentObj =
    userUnoConfig.content && typeof userUnoConfig.content === "object"
      ? userUnoConfig.content
      : null

  const userPipelineIncludes = extractPipelineIncludes(contentObj)
  const userFilesystem = extractFilesystemGlobs(contentObj)

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
            ...userPipelineIncludes
          ]
        },
        filesystem: [uiFilesystemGlob, ...userFilesystem]
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

function extractPipelineIncludes(contentObj: any): (string | RegExp)[] {
  if (!contentObj || typeof contentObj !== "object") return []
  const pipeline =
    "pipeline" in contentObj && contentObj.pipeline && typeof contentObj.pipeline === "object"
      ? contentObj.pipeline
      : null
  const rawIncludes = pipeline && "include" in pipeline ? pipeline.include : undefined
  if (Array.isArray(rawIncludes)) {
    return rawIncludes.filter(
      (item): item is string | RegExp => typeof item === "string" || item instanceof RegExp
    )
  }
  if (typeof rawIncludes === "string" || rawIncludes instanceof RegExp) {
    return [rawIncludes]
  }
  return []
}

function extractFilesystemGlobs(contentObj: any): string[] {
  if (!contentObj || typeof contentObj !== "object") return []
  const rawFilesystem = "filesystem" in contentObj ? contentObj.filesystem : undefined
  if (Array.isArray(rawFilesystem)) {
    return rawFilesystem.filter((item): item is string => typeof item === "string")
  }
  if (typeof rawFilesystem === "string") {
    return [rawFilesystem]
  }
  return []
}
