import { defineTheme } from "../../utils/resolver"

export const collapsibleTheme = defineTheme("collapsible", {
  slots: ["root", "trigger", "content"],
  base: {
    root: "w-full",
    trigger: "flex items-center justify-between w-full font-medium transition-all",
    content: "overflow-hidden transition-all duration-300"
  },
  variants: {
    open: {
      true: { trigger: "", content: "h-auto" },
      false: { trigger: "", content: "h-0 invisible" }
    }
  },
  defaultVariants: {
    open: false
  }
})
