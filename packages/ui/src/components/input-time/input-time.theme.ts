import { defineTheme } from "../../resolver";

export const RLInputTimeTheme = defineTheme("input-time", {
  slots: ["root", "input"],
  base: {
    root: "",
    input: "",
  },
  variants: {
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
  },
  defaultVariants: {
    size: "md",
  },
});
