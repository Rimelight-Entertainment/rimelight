import { defineTheme } from "../../themes"

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
