import { defineTheme } from "../../themes/defineTheme"

export const createDashboardGroupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardGroupTheme()
