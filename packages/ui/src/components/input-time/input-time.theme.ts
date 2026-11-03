import { defineTheme } from "../../resolver";

export const RLInputTimeTheme = defineTheme("input-time", {
  slots: ["root", "input"],
  base: {
    root: "",
    input: "",
  },
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
  defaultVariants: {
    size: "md",
  },
});
