import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../themes"

export const createMarqueeTheme = (_colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
    slots: ["root", "track"],
    base: {
      root: "relative w-full overflow-hidden flex gap-4 mask-gradient-to-r",
      track: "flex shrink-0 gap-4 min-w-full justify-around animate-marquee"
    },
    variants: {
      direction: {
        left: { track: "flex-row animate-marquee-left" },
        right: { track: "flex-row animate-marquee-right" },
        up: { root: "flex-col h-80", track: "flex-col animate-marquee-up" },
        down: { root: "flex-col h-80", track: "flex-col animate-marquee-down" }
      },
      pauseOnHover: {
        true: { track: "hover:[animation-play-state:paused]" },
        false: { track: "" }
      }
    },
    defaultVariants: {
      direction: "left",
      pauseOnHover: true
    }
  })

export default createMarqueeTheme()
