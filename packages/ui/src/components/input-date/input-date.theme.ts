import { defineTheme } from "../../resolver";

export const RLInputDateTheme = defineTheme("input-date", {
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
