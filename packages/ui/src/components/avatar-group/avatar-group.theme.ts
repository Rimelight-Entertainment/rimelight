import { defineTheme } from "../../resolver";

export const RLAvatarGroupTheme = defineTheme("avatar-group", {
  slots: ["root", "base", "more"],
  base: {
    root: "inline-flex flex-row-reverse justify-end items-center",
    base: "relative rounded-full inline-flex shrink-0 aspect-square ring-2 ring-bg first:me-0 hover:z-10 transition-transform",
    more: "relative rounded-full ring-2 ring-bg first:me-0 inline-flex items-center justify-center shrink-0 select-none cursor-default bg-elevated text-muted font-bold hover:z-10 aspect-square",
  },
  variants: {
    size: {
      "3xs": {
        base: "-me-1",
        more: "-me-1 size-4 text-[7px]",
      },
      "2xs": {
        base: "-me-1.5",
        more: "-me-1.5 size-5 text-[8px]",
      },
      xs: {
        base: "-me-1.5",
        more: "-me-1.5 size-6 text-[9px]",
      },
      sm: {
        base: "-me-2",
        more: "-me-2 size-7 text-[10px]",
      },
      md: {
        base: "-me-2.5",
        more: "-me-2.5 size-8 text-[11px]",
      },
      lg: {
        base: "-me-3",
        more: "-me-3 size-9 text-xs",
      },
      xl: {
        base: "-me-3.5",
        more: "-me-3.5 size-10 text-xs",
      },
      "2xl": {
        base: "-me-4",
        more: "-me-4 size-11 text-sm",
      },
      "3xl": {
        base: "-me-4.5",
        more: "-me-4.5 size-12 text-sm",
      },
    },
    color: "auto",
  },
  defaultVariants: {
    size: "md",
    color: "neutral",
  },
});
