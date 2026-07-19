import { defineTheme } from "../../themes"

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
