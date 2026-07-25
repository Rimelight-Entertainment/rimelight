import { defineTheme } from "../../utils/defineTheme"

export const createDashboardResizeHandleTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "hidden lg:block touch-none select-none cursor-ew-resize relative before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5 before:z-1"
    },
    variants: {},
    defaultVariants: {}
  })

export default createDashboardResizeHandleTheme()
