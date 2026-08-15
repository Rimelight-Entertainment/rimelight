import { defineTheme } from "../../utils/resolver"

export const dashboardGroupTheme = defineTheme({
  slots: ["root"],
  base: {
    root: "relative w-full h-full min-h-0 flex overflow-hidden"
  },
  variants: {},
  defaultVariants: {}
})
