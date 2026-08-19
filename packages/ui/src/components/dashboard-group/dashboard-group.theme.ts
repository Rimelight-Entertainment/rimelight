import { defineTheme } from "../../resolver"

export const dashboardGroupTheme = defineTheme("dashboard-group", {
  slots: ["root"],
  base: {
    root: "relative w-full h-full min-h-0 flex overflow-hidden"
  },
  variants: {},
  defaultVariants: {}
})
