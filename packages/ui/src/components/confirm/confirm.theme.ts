import { defineTheme } from "../../resolver";

export const RLConfirmTheme = defineTheme("confirm", {
  slots: ["root", "actions", "cancelButton", "actionButton"],
  base: {
    root: "relative inline-block",
    actions: "flex items-center justify-between w-full",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
