import { defaultColors } from "../../config/colors"
import { defineTheme } from "../../themes/defineTheme"

export const createAvatarGroupTheme = (_colors: readonly string[] = defaultColors) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "flex -space-x-3 hover:space-x-0 transition-all duration-300 [&_[data-slot=root]]:ring-2 [&_[data-slot=root]]:ring-background [&_[data-slot=root]]:transition-all"
    }
  })

export default createAvatarGroupTheme()
