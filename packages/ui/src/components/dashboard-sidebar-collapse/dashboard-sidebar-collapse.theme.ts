import { defineTheme } from "../../utils/defineTheme"

export const createDashboardSidebarCollapseTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "hidden lg:inline-flex items-center justify-center rounded-md size-8 text-muted hover:text-default hover:bg-muted transition-colors"
    },
    variants: {
      side: {
        left: {},
        right: {}
      }
    },
    defaultVariants: {
      side: "left"
    }
  })

export default createDashboardSidebarCollapseTheme()
