import { defineTheme } from "../../types/component"

export const createDashboardSidebarToggleTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "lg:hidden inline-flex items-center justify-center rounded-md size-8 text-muted hover:text-default hover:bg-muted transition-colors"
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

export default createDashboardSidebarToggleTheme()
