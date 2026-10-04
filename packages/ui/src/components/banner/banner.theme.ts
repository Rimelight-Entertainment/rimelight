import { defineTheme } from "../../resolver";

export const bannerTheme = defineTheme("banner", {
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
    root: "relative z-10 w-full transition-colors",
    link: "absolute inset-0 focus:outline-none",
    content: "w-full",
    container: "flex items-center justify-between gap-3 h-12 px-4 sm:px-6 lg:px-8",
    left: "hidden lg:flex-1 lg:flex lg:items-center",
    center: "flex items-center gap-1.5 min-w-0 mx-auto",
    right: "lg:flex-1 flex items-center justify-end gap-1.5",
    icon: "size-5 shrink-0 inline-flex items-center justify-center text-inverted pointer-events-none",
    title: "text-sm text-inverted font-medium truncate",
    actions: "relative flex items-center gap-1.5 shrink-0 isolate",
    close:
      "relative isolate text-inverted hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-current -me-1.5 lg:me-0 transition-colors",
  },
  variants: {
    color: {
      primary: {
        root: "bg-primary text-inverted",
      },
      secondary: {
        root: "bg-secondary text-inverted",
      },
      success: {
        root: "bg-success text-inverted",
      },
      info: {
        root: "bg-info text-inverted",
      },
      warning: {
        root: "bg-warning text-inverted",
      },
      error: {
        root: "bg-error text-inverted",
      },
      neutral: {
        root: "bg-inverted text-inverted",
      },
    },
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
      color: "primary",
      to: true,
      class: {
        root: "hover:bg-primary/90",
      },
    },
    {
      color: "secondary",
      to: true,
      class: {
        root: "hover:bg-secondary/90",
      },
    },
    {
      color: "success",
      to: true,
      class: {
        root: "hover:bg-success/90",
      },
    },
    {
      color: "info",
      to: true,
      class: {
        root: "hover:bg-info/90",
      },
    },
    {
      color: "warning",
      to: true,
      class: {
        root: "hover:bg-warning/90",
      },
    },
    {
      color: "error",
      to: true,
      class: {
        root: "hover:bg-error/90",
      },
    },
    {
      color: "neutral",
      to: true,
      class: {
        root: "hover:bg-inverted/90",
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
