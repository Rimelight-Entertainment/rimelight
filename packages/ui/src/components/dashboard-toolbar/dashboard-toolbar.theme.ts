import { defineTheme } from "../../types/theme"

export const createDashboardToolbarTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardToolbarTheme()
