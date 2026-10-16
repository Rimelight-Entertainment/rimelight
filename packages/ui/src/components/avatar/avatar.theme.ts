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
      "3xs": {
        root: "size-4 text-[8px]",
        badge: "size-1.5",
      },
      "2xs": {
        root: "size-5 text-[10px]",
        badge: "size-2",
      },
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
      "2xl": {
        root: "size-11 text-[22px]",
        badge: "size-4",
      },
      "3xl": {
        root: "size-12 text-2xl",
        badge: "size-4",
      },
      "4xl": {
        root: "size-14 text-3xl",
        badge: "size-4.5",
      },
      "5xl": {
        root: "size-16 text-3xl",
        badge: "size-5",
      },
      "6xl": {
        root: "size-20 text-4xl",
        badge: "size-6",
      },
      "7xl": {
        root: "size-24 text-5xl",
        badge: "size-7",
      },
      "8xl": {
        root: "size-28 text-6xl",
        badge: "size-8",
      },
      "9xl": {
        root: "size-32 text-7xl",
        badge: "size-9",
      },
      "10xl": {
        root: "size-36 text-7xl",
        badge: "size-10",
      },
      "11xl": {
        root: "size-40 text-8xl",
        badge: "size-10",
      },
      "12xl": {
        root: "size-48 text-9xl",
        badge: "size-12",
      },
      "4": { root: "size-4 text-[8px]", badge: "size-1.5" },
      "5": { root: "size-5 text-[10px]", badge: "size-2" },
      "6": { root: "size-6 text-xs", badge: "size-2" },
      "7": { root: "size-7 text-sm", badge: "size-2.5" },
      "8": { root: "size-8 text-base", badge: "size-3" },
      "9": { root: "size-9 text-lg", badge: "size-3" },
      "10": { root: "size-10 text-xl", badge: "size-3.5" },
      "11": { root: "size-11 text-[22px]", badge: "size-4" },
      "12": { root: "size-12 text-2xl", badge: "size-4" },
      "14": { root: "size-14 text-3xl", badge: "size-4.5" },
      "16": { root: "size-16 text-3xl", badge: "size-5" },
      "20": { root: "size-20 text-4xl", badge: "size-6" },
      "24": { root: "size-24 text-5xl", badge: "size-7" },
      "28": { root: "size-28 text-6xl", badge: "size-8" },
      "32": { root: "size-32 text-7xl", badge: "size-9" },
      "36": { root: "size-36 text-7xl", badge: "size-10" },
      "40": { root: "size-40 text-8xl", badge: "size-10" },
      "48": { root: "size-48 text-9xl", badge: "size-12" },
      "56": { root: "size-56 text-9xl", badge: "size-14" },
      "64": { root: "size-64 text-9xl", badge: "size-16" },
      "128": { root: "size-32 text-7xl", badge: "size-9" },
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
    color: "neutral",
    badgePosition: "bottom-right",
  },
});
