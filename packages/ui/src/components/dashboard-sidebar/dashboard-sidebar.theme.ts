import { defineTheme } from "../../types/theme"

export const createDashboardSidebarTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardSidebarTheme()
