import { defineTheme } from "../../types/theme"

export const createDashboardPanelTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardPanelTheme()
