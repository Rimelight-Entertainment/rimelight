import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../themes/defineTheme"

export const createAspectRatioTheme = (_colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
    slots: ["root", "content"],
    base: {
      root: "relative w-full overflow-hidden",
      content: "absolute inset-0 h-full w-full object-cover"
    }
  })

export default createAspectRatioTheme()
