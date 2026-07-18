import { defineTheme } from "../../types/theme"

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
