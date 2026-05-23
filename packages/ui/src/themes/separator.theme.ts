import { defineTheme } from "../utils/defineTheme"

export const separatorTheme = defineTheme({
  slots: ["root"],
  base: {
    root: "shrink-0 bg-border"
  },
  variants: {
    orientation: {
      horizontal: { root: "h-[1px] w-full" },
      vertical: { root: "h-full w-[1px]" }
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
})

export default separatorTheme
