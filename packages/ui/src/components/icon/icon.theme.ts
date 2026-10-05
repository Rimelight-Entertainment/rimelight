import { defineTheme } from "../../resolver";

export const RLIconTheme = defineTheme("icon", {
  slots: ["root"],
  base: {
    root: "shrink-0 inline-flex items-center justify-center leading-none",
  },
  variants: {
    size: {
      none: { root: "" },
      xs: { root: "size-3" },
      sm: { root: "size-4" },
      md: { root: "size-5" },
      lg: { root: "size-6" },
      xl: { root: "size-8" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
