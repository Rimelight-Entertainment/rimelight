import { defineTheme } from "../../themes"

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
