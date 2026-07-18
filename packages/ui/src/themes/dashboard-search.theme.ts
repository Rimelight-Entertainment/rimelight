import { defineTheme } from "./defineTheme"

export const createDashboardSearchTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardSearchTheme()
