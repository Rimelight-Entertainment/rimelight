import { defineTheme } from "../../types/component"

export const createDashboardGroupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "relative w-full h-full min-h-0 flex overflow-hidden"
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardGroupTheme()
