import { defineTheme } from "../utils/defineTheme"

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
