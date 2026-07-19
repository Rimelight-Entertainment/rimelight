import { defineTheme } from "../../themes"

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
