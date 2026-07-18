import { defineTheme } from "./defineTheme"

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
