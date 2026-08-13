import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./config"
import { colorConfig } from "./config"
import rimelightUiPreset, { uiFilesystemGlob, uiSrcGlob } from "./presets"

export function ui(options: UIConfig = {}): AstroIntegration[] {
  const { colors = {}, logos = {}, shortcuts = {}, icons = {}, components, unocss = {} } = options
  const unoContent = typeof unocss.content === "object" ? unocss.content : undefined

  return [
    UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(options), ...(unocss.presets ?? [])],
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
              unoContent?.pipeline && typeof unoContent.pipeline === "object"
                ? (unoContent.pipeline as { include?: unknown }).include
                : undefined,
              (i): i is string | RegExp => typeof i === "string" || i instanceof RegExp
            )
          ]
        },
        filesystem: [
          uiFilesystemGlob,
          ...extractList(unoContent?.filesystem, (i): i is string => typeof i === "string")
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
                "import.meta.env.RIMELIGHT_UI_CONFIG": JSON.stringify({
                  ...components?.themes,
                  logos,
                  colors: [...new Set([...colorConfig.colors, ...Object.keys(colors)])],
                  shortcuts,
                  icons
                })
              }
            }
          })
        }
      }
    }
  ]
}

const extractList = <T>(v: unknown, g: (x: unknown) => x is T): T[] =>
  v ? (Array.isArray(v) ? v : [v]).filter(g) : []
