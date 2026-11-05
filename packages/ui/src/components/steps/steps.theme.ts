import { defineTheme } from "../../resolver";

export const RLStepsTheme = defineTheme("steps", {
  slots: ["root"],
  base: {
    root: "w-full",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
