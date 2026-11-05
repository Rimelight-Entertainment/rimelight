import { defineTheme } from "../../resolver";

export const RLAvatarTheme = defineTheme("avatar", {
  slots: ["root", "image", "fallback", "icon", "badge", "wrapper", "text", "title", "subtitle"],
  base: {
    root: "inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle relative text-[var(--rl-text)] bg-elevated",
    image: "h-full w-full rounded-[inherit] object-cover",
    fallback: "font-medium truncate text-inherit",
    icon: "shrink-0 text-inherit",
    badge: "absolute rounded-full ring-2 ring-bg",
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
        badge: "size-2",
      },
      sm: {
        root: "size-7 text-sm",
        badge: "size-2.5",
      },
      md: {
        root: "size-8 text-base",
        badge: "size-3",
      },
      lg: {
        root: "size-9 text-lg",
        badge: "size-3",
      },
      xl: {
        root: "size-10 text-xl",
        badge: "size-3.5",
      },
    },
    badgePosition: {
      "top-right": { badge: "top-0 right-0" },
      "bottom-right": { badge: "bottom-0 right-0" },
      "top-left": { badge: "top-0 left-0" },
      "bottom-left": { badge: "bottom-0 left-0" },
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
    badgePosition: "bottom-right",
  },
});
