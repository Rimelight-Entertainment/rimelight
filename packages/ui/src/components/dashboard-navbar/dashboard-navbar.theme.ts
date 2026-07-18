import { defineTheme } from "../../themes/defineTheme"

export const createDashboardNavbarTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardNavbarTheme()
