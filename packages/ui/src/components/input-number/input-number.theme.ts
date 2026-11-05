import { defineTheme } from "../../resolver";

const STEPPER =
  "flex size-6 items-center justify-center rounded-sm text-muted hover:bg-muted/60 hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-50";

export const RLInputNumberTheme = defineTheme("input-number", {
  slots: ["root", "input", "increment", "decrement"],
  base: {
    root: "",
    input:
      "pr-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
    increment: STEPPER,
    decrement: STEPPER,
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
