import { defineTheme } from "../../resolver"

export const tooltipTheme = defineTheme("tooltip", {
  slots: ["root", "trigger", "content"],
  base: {
    root: "relative inline-block group/tooltip",
    trigger: "",
    content: [
      "absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95",
      "transition-all duration-150 invisible opacity-0 scale-95 origin-center pointer-events-none",
      "group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100"
    ]
  },
  variants: {
    placement: {
      top: { content: "bottom-full left-1/2 -translate-x-1/2 mb-1.5" },
      bottom: { content: "top-full left-1/2 -translate-x-1/2 mt-1.5" },
      left: { content: "right-full top-1/2 -translate-y-1/2 mr-1.5" },
      right: { content: "left-full top-1/2 -translate-y-1/2 ml-1.5" }
    }
  },
  defaultVariants: {
    placement: "top"
  }
})
