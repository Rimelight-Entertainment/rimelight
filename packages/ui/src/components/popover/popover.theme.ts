import { defineTheme } from "../../utils/resolver"

export const popoverTheme = defineTheme({
  slots: ["root", "trigger", "content"],
  base: {
    root: "relative inline-block",
    trigger: "",
    content: [
      "absolute z-50 w-72 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-neutral-900 dark:text-neutral-100 shadow-xl outline-none"
    ]
  },
  variants: {
    placement: {
      "top": { content: "bottom-full left-1/2 -translate-x-1/2 mb-2" },
      "bottom": { content: "top-full left-1/2 -translate-x-1/2 mt-2" },
      "bottom-end": { content: "top-full right-0 left-auto mt-2" },
      "bottom-start": { content: "top-full left-0 right-auto mt-2" },
      "left": { content: "right-full top-1/2 -translate-y-1/2 mr-2" },
      "right": { content: "left-full top-1/2 -translate-y-1/2 ml-2" }
    }
  },
  defaultVariants: {
    placement: "bottom"
  }
})
