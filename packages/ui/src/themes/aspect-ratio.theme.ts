import { defaultColors } from "../presets/defaults"
import { defineTheme } from "../utils/defineTheme"

export const createAspectRatioTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "content"],
    base: {
      root: "relative w-full overflow-hidden",
      content: "absolute inset-0 h-full w-full object-cover"
    }
  })

export default createAspectRatioTheme()
