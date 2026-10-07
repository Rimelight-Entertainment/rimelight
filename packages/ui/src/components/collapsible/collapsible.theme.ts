import { defineTheme } from "../../resolver";

export const RLCollapsibleTheme = defineTheme("collapsible", {
  slots: ["root", "trigger", "content"],
  base: {
    root: "w-full",
    trigger: "w-full",
    content:
      "data-[state=open]:animate-[collapsible-down_200ms_var(--ease-out)] data-[state=closed]:animate-[collapsible-up_200ms_var(--ease-out)] data-[state=closed]:overflow-hidden",
  },
  variants: {
    open: {
      true: {},
      false: {},
    },
    disabled: {
      true: {
        trigger: "cursor-not-allowed opacity-75",
      },
      false: {},
    },
  },
  defaultVariants: {
    open: false,
    disabled: false,
  },
});
