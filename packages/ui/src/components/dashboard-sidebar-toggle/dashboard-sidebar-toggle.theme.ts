import { defineTheme } from "../../types/theme"

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
