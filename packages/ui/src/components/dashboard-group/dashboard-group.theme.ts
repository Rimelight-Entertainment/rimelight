import { defineTheme } from "../../utils/defineTheme"

export const createDashboardGroupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "fixed inset-0 flex overflow-hidden"
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardGroupTheme()
