import { defineTheme } from "../../resolver";

export const RLAvatarTheme = defineTheme("avatar", {
  slots: ["root", "image", "fallback", "icon", "badge", "wrapper", "text", "title", "subtitle"],
  base: {
    root: "inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle relative text-[var(--rl-text)] bg-elevated",
    image: "h-full w-full rounded-[inherit] object-cover",
    fallback: "font-medium truncate text-current",
    icon: "shrink-0 text-current",
    badge: "leading-none font-medium",
    wrapper: "inline-flex items-center gap-3",
    text: "flex flex-col leading-tight",
    title: "font-medium text-sm text-default leading-tight",
    subtitle: "text-xs text-muted leading-tight",
  },
  variants: {
    color: "auto",
    size: {
      xs: {
        root: "size-6 text-xs",
      },
      sm: {
        root: "size-7 text-sm",
      },
      md: {
        root: "size-8 text-base",
      },
      lg: {
        root: "size-9 text-lg",
      },
      xl: {
        root: "size-10 text-xl",
      },
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      class: {
        root: "bg-elevated text-highlighted",
        fallback: "text-muted",
        icon: "text-muted",
      },
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});
