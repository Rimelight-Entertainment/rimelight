import { defineTheme } from "./defineTheme"

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
