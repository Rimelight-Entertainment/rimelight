import { defineTheme } from "../../themes/defineTheme"

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
