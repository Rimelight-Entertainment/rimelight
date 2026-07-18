import { defaultColors } from "../presets/defaults"
import { defineTheme } from "./defineTheme"

export const createStickySurfaceTheme = (_colors: readonly string[] = defaultColors) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "sticky top-0 self-start transition-all duration-300"
    }
  })

export default createStickySurfaceTheme()
