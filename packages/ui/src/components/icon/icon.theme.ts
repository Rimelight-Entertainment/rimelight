import { defineTheme } from "../../resolver";

export const iconTheme = defineTheme("icon", {
  slots: ["root"],
  base: {
    root: "shrink-0 inline-block align-middle leading-none",
  },
  variants: {
    size: {
      xs: { root: "h-3 w-3" },
      sm: { root: "h-4 w-4" },
      md: { root: "h-5 w-5" },
      lg: { root: "h-6 w-6" },
      xl: { root: "h-8 w-8" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
