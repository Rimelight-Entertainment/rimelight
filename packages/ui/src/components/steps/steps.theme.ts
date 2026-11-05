import { defineTheme } from "../../resolver";

export const RLStepsTheme = defineTheme("steps", {
  slots: ["root", "list"],
  base: {
    root: "w-full",
    list: "rl-steps-list",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
