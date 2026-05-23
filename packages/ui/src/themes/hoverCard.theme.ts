import { defineTheme } from "../utils/defineTheme"

export const hoverCardTheme = defineTheme({
  slots: ["root", "trigger", "content"],
  base: {
    root: "relative inline-block group/hover-card",
    trigger: "",
    content: [
      "absolute z-50 w-80 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-md outline-none",
      "transition-all duration-200 invisible opacity-0 scale-95 origin-center pointer-events-none",
      "group-hover/hover-card:visible group-hover/hover-card:opacity-100 group-hover/hover-card:scale-100 group-hover/hover-card:pointer-events-auto"
    ]
  },
  variants: {
    placement: {
      top: { content: "bottom-full left-1/2 -translate-x-1/2 mb-2" },
      bottom: { content: "top-full left-1/2 -translate-x-1/2 mt-2" },
      left: { content: "right-full top-1/2 -translate-y-1/2 mr-2" },
      right: { content: "left-full top-1/2 -translate-y-1/2 ml-2" }
    }
  },
  defaultVariants: {
    placement: "bottom"
  }
})

export default hoverCardTheme
