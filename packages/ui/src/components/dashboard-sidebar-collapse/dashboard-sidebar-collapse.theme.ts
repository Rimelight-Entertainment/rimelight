import { defineTheme } from "../../types/theme"

export const createDashboardSidebarCollapseTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardSidebarCollapseTheme()
