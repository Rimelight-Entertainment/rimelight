import { defineTheme } from "../../resolver";

export const RLSpinnerTheme = defineTheme("spinner", {
  slots: ["root"],
  base: {
    root: "animate-spin shrink-0 rounded-full border-2 border-t-transparent text-current border-current",
  },
  variants: {
    size: {
      xs: { root: "size-3" },
      sm: { root: "size-4" },
      md: { root: "size-6" },
      lg: { root: "size-8" },
      xl: { root: "size-10" },
    },
    color: "auto",
  },
  defaultVariants: {
    size: "md",
  },
});
