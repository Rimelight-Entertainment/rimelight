import { defineTheme } from "../../themes/defineTheme"

export const createDashboardSidebarToggleTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardSidebarToggleTheme()
