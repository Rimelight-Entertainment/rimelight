import { defineTheme } from "../utils/defineTheme"

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
