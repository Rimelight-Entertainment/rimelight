import { defineTheme } from "../../types/theme"

export const createDashboardGroupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardGroupTheme()
