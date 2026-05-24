import { defineTheme } from "../utils/defineTheme"

export const avatarGroupTheme = defineTheme({
  slots: ["root"],
  base: {
    root: "flex -space-x-3 hover:space-x-0 transition-all duration-300 [&_[data-slot=root]]:ring-2 [&_[data-slot=root]]:ring-background [&_[data-slot=root]]:transition-all"
  }
})

export default avatarGroupTheme
