import { defineTheme } from "./defineTheme"

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
