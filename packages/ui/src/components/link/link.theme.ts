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
    unstyled: {
      true: {},
      false: {},
    },
    active: {
      true: {},
      false: {},
    },
    disabled: {
      true: { root: "cursor-not-allowed opacity-75" },
    },
  },
  compoundVariants: [
    { unstyled: false, active: false, class: { root: "text-muted" } },
    { unstyled: false, active: false, disabled: false, class: { root: "hover:text-default" } },
    { unstyled: false, active: true, class: { root: "text-primary" } },
    { unstyled: false, active: true, disabled: false, class: { root: "hover:text-primary" } },
  ],
  defaultVariants: {
    unstyled: false,
    active: false,
  },
});
