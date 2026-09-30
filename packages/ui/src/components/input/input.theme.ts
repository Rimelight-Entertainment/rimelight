import { defineTheme } from "../../resolver";

export const inputTheme = defineTheme("input", {
  slots: ["root", "input", "leading", "trailing"],
  base: {
    root: "relative flex items-center w-full rounded-md border border-default bg-default shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
    input:
      "w-full bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
    leading: "absolute left-3 flex items-center justify-center text-muted",
    trailing: "absolute right-3 flex items-center justify-center text-muted"
  },
  variants: {
    variant: {
      default: {},
      ghost: {
        root: "bg-transparent border-none shadow-none focus-within:ring-0"
      }
    },
    size: {
      sm: { input: "py-1 text-xs", leading: "left-2.5", trailing: "right-2.5" },
      md: { input: "py-1.5 text-sm", leading: "left-3", trailing: "right-3" },
      lg: { input: "py-2 text-base", leading: "left-3.5", trailing: "right-3.5" }
    },
    hasLeading: {
      true: { input: "pl-9" }
    },
    hasTrailing: {
      true: { input: "pr-9" }
    },
    error: {
      true: { root: "border-error-500 focus-within:ring-error-500/50" }
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    hasLeading: false,
    hasTrailing: false,
    error: false
  }
});
