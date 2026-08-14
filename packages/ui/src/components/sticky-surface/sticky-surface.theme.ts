import { colorNames } from "../../config"
import { defineTheme } from "../../types/component"

export const createStickySurfaceTheme = (_colors: readonly string[] = colorNames) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "sticky top-0 self-start transition-all duration-300"
    }
  })

export default createStickySurfaceTheme()
