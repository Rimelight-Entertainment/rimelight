import { defineTheme } from "../../themes/defineTheme"

export const createDashboardResizeHandleTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardResizeHandleTheme()
