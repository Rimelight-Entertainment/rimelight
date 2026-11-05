import { defineTheme } from "../../resolver";

export const RLLinkTheme = defineTheme("link", {
  slots: ["root", "label", "leadingIcon", "trailingIcon", "externalHint"],
  base: {
    root: "outline-primary/25 focus-visible:outline-3 rounded-md inline-flex items-center gap-1 leading-none transition-colors",
    leadingIcon: "-translate-y-[1.5px]",
    trailingIcon: "-translate-y-[1.5px]",
    externalHint: "sr-only",
  },
  variants: {
    active: {
      true: { root: "text-primary" },
      false: { root: "text-muted" },
    },
    disabled: {
      true: { root: "cursor-not-allowed opacity-75" },
    },
  },
  compoundVariants: [
    {
      active: false,
      disabled: false,
      class: { root: "hover:text-default" },
    },
    {
      active: true,
      disabled: false,
      class: { root: "hover:text-primary" },
    },
  ],
  defaultVariants: {
    active: false,
  },
});
