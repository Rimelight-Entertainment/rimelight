import type { AstroIntegration } from "astro"
import UnoCSS from "unocss/astro"
import type { UIConfig } from "./config"
import { colorConfig } from "./config"
import rimelightUiPreset from "./presets"

export function ui(o: UIConfig = {}): AstroIntegration[] {
  const { colors = {}, logos = {}, shortcuts = {}, icons = {}, components, unocss = {} } = o

  return [
    UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(o), ...(unocss.presets ?? [])],
      safelist: [
        ...Object.values(icons).filter(
          (v): v is string => typeof v === "string" && v.startsWith("i-")
        ),
        ...(unocss.safelist ?? [])
      ]
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
