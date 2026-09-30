import { defineTheme } from "../../resolver";

export const pageBodyTheme = defineTheme("page-body", {
  slots: ["root"],
  base: {
    root: "",
  },
  variants: {},
  defaultVariants: {},
});
