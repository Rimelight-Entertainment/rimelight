import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./config"
import { colorConfig } from "./config"
import rimelightUiPreset, { uiFilesystemGlob, uiSrcGlob } from "./presets"

export function ui(o: UIConfig = {}): AstroIntegration[] {
  const { colors = {}, logos = {}, shortcuts = {}, icons = {}, components, unocss = {} } = o
  const c = (typeof unocss.content === "object" ? unocss.content : {}) as Record<string, any>

  return [
    UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(o), ...(unocss.presets ?? [])],
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
            ...toArr(c.pipeline?.include).filter(
              (i): i is string | RegExp => typeof i === "string" || i instanceof RegExp
            )
          ]
        },
        filesystem: [
          uiFilesystemGlob,
          ...toArr(c.filesystem).filter((i): i is string => typeof i === "string")
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

const toArr = (v: unknown) => (Array.isArray(v) ? v : v ? [v] : [])
