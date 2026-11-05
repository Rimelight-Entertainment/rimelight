import { defineTheme } from "../../resolver";

export const RLInputDateTheme = defineTheme("input-date", {
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
