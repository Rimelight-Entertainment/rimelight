import { defineTheme } from "../../types/theme"

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
