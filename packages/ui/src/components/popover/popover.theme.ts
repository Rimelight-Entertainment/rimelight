import { defineTheme } from "../../resolver";

export const popoverTheme = defineTheme("popover", {
  slots: ["root", "trigger", "content"],
  base: {
    root: "relative inline-flex items-center justify-center",
    trigger: "inline-flex items-center justify-center",
    content: [
      "absolute z-50 rounded-xl border border-default bg-elevated text-highlighted shadow-xl outline-none pointer-events-none"
    ]
  },
  variants: {
    size: {
      xs: { content: "p-1.5 whitespace-nowrap" },
      sm: { content: "p-2 whitespace-nowrap" },
      md: { content: "p-2.5 whitespace-nowrap" },
      lg: { content: "p-3 whitespace-nowrap" }
    },
    placement: {
      top: { content: "bottom-full left-1/2 -translate-x-1/2 mb-2" },
      "top-start": { content: "bottom-full left-0 right-auto mb-2" },
      "top-end": { content: "bottom-full right-0 left-auto mb-2" },
      bottom: { content: "top-full left-1/2 -translate-x-1/2 mt-2" },
      "bottom-end": { content: "top-full right-0 left-auto mt-2" },
      "bottom-start": { content: "top-full left-0 right-auto mt-2" },
      left: { content: "right-full top-1/2 -translate-y-1/2 mr-2" },
      right: { content: "left-full top-1/2 -translate-y-1/2 ml-2" }
    }
  },
  defaultVariants: {
    size: "md",
    placement: "bottom"
  }
});
