import { defineTheme } from "../../resolver";

export const logoTheme = defineTheme("logo", {
  slots: ["root"],
  base: {
    root: "flex items-center justify-center transition-opacity hover:opacity-80 shrink-0 select-none overflow-hidden",
  },
  variants: {},
  defaultVariants: {},
});
