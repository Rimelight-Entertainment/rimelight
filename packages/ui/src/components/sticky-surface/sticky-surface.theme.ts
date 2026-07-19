import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../themes"

export const createStickySurfaceTheme = (_colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "sticky top-0 self-start transition-all duration-300"
    }
  })

export default createStickySurfaceTheme()
