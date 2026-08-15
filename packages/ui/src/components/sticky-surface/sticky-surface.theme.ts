import { defineTheme } from "../../utils/resolver"

export const stickySurfaceTheme = defineTheme({
  slots: ["root"],
  base: {
    root: "sticky top-0 self-start transition-all duration-300"
  }
})
