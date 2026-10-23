import { defineTheme } from "../../resolver";

export const RLMainTheme = defineTheme("main", {
  slots: ["root"],
  base: {
    root: "flex-1 min-h-[calc(100vh-var(--rl-header-height))] pt-[var(--rl-header-height,0px)]",
  },
  variants: {},
  defaultVariants: {},
});
