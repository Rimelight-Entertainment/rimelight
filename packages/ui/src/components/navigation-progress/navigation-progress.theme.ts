import { defineTheme } from "../../resolver";

export const RLNavigationProgressTheme = defineTheme("navigation-progress", {
  slots: ["root", "bar"],
  base: {
    root: "fixed top-0 inset-x-0 z-50 pointer-events-none overflow-hidden bg-transparent",
    bar: "h-full w-full origin-left-right animate-pulse bg-[var(--rl-bg)]",
  },
  variants: {
    color: "auto",
    size: {
      xs: {
        root: "h-0.5",
      },
      sm: {
        root: "h-1",
      },
      md: {
        root: "h-1.5",
      },
      lg: {
        root: "h-2",
      },
    },
  },
  defaultVariants: {
    color: "primary",
    size: "sm",
  },
});
