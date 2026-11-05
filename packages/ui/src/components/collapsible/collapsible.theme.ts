import { defineTheme } from "../../resolver";

export const RLCollapsibleTheme = defineTheme("collapsible", {
  slots: ["root", "trigger", "body"],
  base: {
    root: "w-full",
    trigger: "w-full",
    body: "data-[state=open]:animate-[collapsible-down_200ms_var(--ease-out)] data-[state=closed]:animate-[collapsible-up_200ms_var(--ease-out)] data-[state=closed]:overflow-hidden",
  },
  variants: {
    disabled: {
      true: {
        trigger: "cursor-not-allowed opacity-75",
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});
