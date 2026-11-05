import { defineTheme } from "../../resolver";

const STEPPER =
  "flex size-6 items-center justify-center rounded-sm text-muted hover:bg-muted/60 hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-50";

export const RLInputNumberTheme = defineTheme("input-number", {
  slots: ["root", "wrapper", "input", "stepper", "increment", "decrement"],
  base: {
    wrapper: "relative w-full",
    input:
      "pr-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
    stepper: "absolute right-1 top-1/2 flex -translate-y-1/2 flex-col",
    increment: STEPPER,
    decrement: STEPPER,
  },
});
