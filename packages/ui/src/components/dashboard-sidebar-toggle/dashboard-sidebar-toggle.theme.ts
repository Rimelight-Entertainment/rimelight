import { defineTheme } from "../../utils/defineTheme"

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
