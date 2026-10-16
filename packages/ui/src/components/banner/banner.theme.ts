import { defineTheme } from "../../resolver";

export const RLBannerTheme = defineTheme("banner", {
  slots: [
    "root",
    "link",
    "content",
    "container",
    "left",
    "center",
    "right",
    "icon",
    "title",
    "actions",
    "close",
  ],
  base: {
    root: "relative z-10 w-full transition-colors text-white bg-[var(--rl-bg)]",
    link: "absolute inset-0 focus:outline-none",
    content: "w-full",
    container: "flex items-center justify-between gap-3 h-12 px-4 sm:px-6 lg:px-8",
    left: "hidden lg:flex-1 lg:flex lg:items-center",
    center: "flex items-center gap-1.5 min-w-0 mx-auto",
    right: "lg:flex-1 flex items-center justify-end gap-1.5",
    icon: "size-5 shrink-0 inline-flex items-center justify-center text-white pointer-events-none",
    title: "text-sm text-white font-medium truncate",
    actions: "relative flex items-center gap-1.5 shrink-0 isolate",
    close:
      "relative isolate text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-current -me-1.5 lg:me-0 transition-colors",
  },
  variants: {
    color: "auto",
    contain: {
      true: {
        container: "mx-auto max-w-90rem",
      },
      false: {
        container: "max-w-none",
      },
    },
    sticky: {
      true: {
        root: "sticky top-0 inset-x-0 z-50 transition-[top,transform] duration-300 ease-in-out data-[collapsed=true]:-translate-y-full",
      },
      false: {},
    },
    fixed: {
      true: {
        root: "fixed top-0 left-0 right-0 z-50 transition-[top,transform,opacity] duration-300 ease-in-out data-[collapsed=true]:-translate-y-full",
      },
      false: {},
    },
    to: {
      true: {
        root: "has-[>a:focus-visible]:outline-2 has-[>a:focus-visible]:outline-solid has-[>a:focus-visible]:outline-current -outline-offset-3",
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      class: {
        root: "!bg-inverted",
      },
    },
    {
      to: true,
      class: {
        root: "hover:bg-[var(--rl-bg-hover)]",
      },
    },
    {
      color: "neutral",
      to: true,
      class: {
        root: "hover:!bg-inverted/90",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    contain: true,
    sticky: false,
    fixed: false,
  },
});
