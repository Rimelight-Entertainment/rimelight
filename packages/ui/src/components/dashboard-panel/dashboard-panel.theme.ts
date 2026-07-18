import { defineTheme } from "../../themes/defineTheme"

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
