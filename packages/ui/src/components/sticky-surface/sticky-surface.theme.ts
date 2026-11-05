import { defineTheme } from "../../resolver";

export const RLStickySurfaceTheme = defineTheme("sticky-surface", {
  slots: ["root"],
  base: {
    root: "sticky top-[var(--rl-sticky-top,0px)]! z-[var(--rl-sticky-z,10)]! self-start transition-all duration-300 [container-type:scroll-state] [container-name:rl-sticky]",
  },
  variants: {
    stuckShadow: {
      true: {
        root: "rl-sticky-shadow",
      },
    },
  },
  defaultVariants: {
    stuckShadow: true,
  },
});
