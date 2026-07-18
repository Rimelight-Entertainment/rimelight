import { defineTheme } from "../../types/theme"

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
