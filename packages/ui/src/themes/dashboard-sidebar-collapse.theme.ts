import { defineTheme } from "../utils/defineTheme"

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
