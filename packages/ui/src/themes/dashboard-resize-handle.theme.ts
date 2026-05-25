import { defineTheme } from "../utils/defineTheme"

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
