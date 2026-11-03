import { defineTheme } from "../../resolver";

export const RLFieldGroupTheme = defineTheme("field-group", {
  slots: ["root", "leading", "trailing"],
  base: {
    root: "relative flex items-stretch w-full rounded-md border border-default bg-default shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden",
    leading: "flex items-center bg-muted px-3 text-sm text-muted border-e border-default",
    trailing: "flex items-center bg-muted px-3 text-sm text-muted border-s border-default",
  },
  variants: {
    size: {
      sm: { leading: "px-2 text-xs", trailing: "px-2 text-xs" },
      md: { leading: "px-3 text-sm", trailing: "px-3 text-sm" },
      lg: { leading: "px-4 text-base", trailing: "px-4 text-base" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
