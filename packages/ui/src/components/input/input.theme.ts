import { defineTheme } from "../../resolver";

export const RLInputTheme = defineTheme("input", {
  slots: ["root", "input", "leading", "trailing"],
  base: {
    root: "relative flex items-center w-full rounded-md border border-default bg-default shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
    input:
      "w-full bg-transparent outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
    leading: "absolute flex items-center justify-center text-muted",
    trailing: "absolute flex items-center justify-center text-muted",
  },
  variants: {
    variant: {
      ghost: {
        root: "bg-transparent border-none shadow-none focus-within:ring-0",
      },
    },
    size: {
      xs: { input: "text-xs leading-none px-2 py-1", leading: "left-2", trailing: "right-2" },
      sm: {
        input: "text-xs leading-none px-2.5 py-1.5",
        leading: "left-2.5",
        trailing: "right-2.5",
      },
      md: {
        input: "text-sm leading-none px-2.5 py-1.5",
        leading: "left-2.5",
        trailing: "right-2.5",
      },
      lg: { input: "text-sm leading-none px-3 py-2", leading: "left-3", trailing: "right-3" },
      xl: { input: "text-base leading-none px-3 py-2", leading: "left-3", trailing: "right-3" },
    },
    hasLeading: {
      true: { input: "pl-9" },
    },
    hasTrailing: {
      true: { input: "pr-9" },
    },
    invalid: {
      true: { root: "border-error focus-within:ring-error/50" },
    },
  },
  defaultVariants: {
    size: "md",
    hasLeading: false,
    hasTrailing: false,
    invalid: false,
  },
});
