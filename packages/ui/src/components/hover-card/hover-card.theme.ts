import { defineTheme } from "../../resolver";

export const RLHoverCardTheme = defineTheme("hover-card", {
  slots: ["root", "trigger", "content"],
  base: {
    root: "relative inline-block",
    trigger: "",
    content: [
      "absolute z-50 w-80 rounded-lg border border-default bg-elevated p-4 text-highlighted shadow-md outline-none",
      "transition-all duration-200 invisible opacity-0 scale-95 origin-center pointer-events-none",
      "data-[state=open]:visible data-[state=open]:opacity-100 data-[state=open]:scale-100 data-[state=open]:pointer-events-auto",
    ],
  },
  variants: {
    placement: {
      top: { content: "bottom-full left-1/2 -translate-x-1/2 mb-2" },
      bottom: { content: "top-full left-1/2 -translate-x-1/2 mt-2" },
      left: { content: "right-full top-1/2 -translate-y-1/2 mr-2" },
      right: { content: "left-full top-1/2 -translate-y-1/2 ml-2" },
    },
  },
  defaultVariants: {
    placement: "bottom",
  },
});
