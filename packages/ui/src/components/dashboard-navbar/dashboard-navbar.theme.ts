import { defineTheme } from "../../themes"

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
