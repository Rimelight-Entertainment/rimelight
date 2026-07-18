import { defineTheme } from "../../themes/defineTheme"

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
