import { defineTheme } from "../../themes"

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
