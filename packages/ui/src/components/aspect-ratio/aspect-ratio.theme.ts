import { colorNames } from "../../config"
import { defineTheme } from "../../utils/resolver"

export const createAspectRatioTheme = (_colors: readonly string[] = colorNames) =>
  defineTheme({
    slots: ["root", "content"],
    base: {
      root: "relative w-full overflow-hidden",
      content: "absolute inset-0 h-full w-full object-cover"
    }
  })

export default createAspectRatioTheme()
