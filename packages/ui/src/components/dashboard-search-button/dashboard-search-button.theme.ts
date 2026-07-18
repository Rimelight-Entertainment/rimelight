import { defineTheme } from "../../types/theme"

export const createDashboardSearchButtonTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardSearchButtonTheme()
