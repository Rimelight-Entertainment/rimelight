import { defineTheme } from "../utils/defineTheme"

export const createSplitterTheme = () =>
  defineTheme({
    slots: ["root", "panel", "handle"],
    base: {
      root: "flex w-full h-full",
      panel: "overflow-auto transition-all",
      handle:
        "flex items-center justify-center bg-border hover:bg-primary/50 transition-colors cursor-col-resize select-none"
    },
    variants: {
      direction: {
        horizontal: { root: "flex-row", handle: "w-1.5 h-full cursor-col-resize" },
        vertical: { root: "flex-col", handle: "h-1.5 w-full cursor-row-resize" }
      }
    },
    defaultVariants: {
      direction: "horizontal"
    }
  })

export default createSplitterTheme()
