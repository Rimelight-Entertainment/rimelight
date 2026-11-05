import { defineTheme } from "../../resolver";

export const RLStepperTheme = defineTheme("stepper", {
  slots: [
    "root",
    "header",
    "item",
    "container",
    "trigger",
    "indicator",
    "icon",
    "separator",
    "wrapper",
    "title",
    "description",
    "body",
    "panel",
  ],
  base: {
    root: "flex gap-4 w-full",
    header: "flex justify-between items-start w-full",
    item: "group flex-1 flex flex-col items-center text-center relative",
    container: "flex items-center justify-center relative w-full",
    trigger:
      "rounded-full font-medium text-center align-middle flex items-center justify-center font-semibold group-data-[state=completed]:bg-[var(--rl-bg)] group-data-[state=completed]:border-[var(--rl-bg)] group-data-[state=completed]:text-inverted group-data-[state=active]:bg-[var(--rl-bg)] group-data-[state=active]:border-[var(--rl-bg)] group-data-[state=active]:text-inverted text-muted bg-muted border border-default transition-all cursor-pointer z-10",
    indicator: "flex items-center justify-center size-full text-current",
    icon: "shrink-0 size-4 text-current transition-colors",
    separator:
      "flex-1 h-0.5 mx-2 self-start mt-4 transition-colors rounded-full bg-muted data-[state=completed]:bg-primary",
    wrapper: "mt-2 text-center",
    title:
      "text-xs font-semibold group-data-[state=active]:font-bold group-data-[state=active]:text-[var(--rl-text)] group-data-[state=completed]:text-[var(--rl-text)] text-muted transition-colors",
    description: "text-dimmed text-wrap text-xs",
    body: "size-full",
    panel: "w-full",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex-col",
        header: "flex-row",
        container: "flex justify-center items-center",
        separator: "top-1/2 -translate-y-1/2 h-0.5",
        wrapper: "mt-1.5",
      },
      vertical: {
        header: "flex-col gap-4",
        item: "flex flex-row text-start items-start gap-3",
        container: "flex flex-col items-center justify-start h-full",
        separator: "start-1/2 -translate-x-1/2 w-0.5",
      },
    },
    size: {
      xs: {
        trigger: "size-6 text-xs",
        icon: "size-3",
        title: "text-xs",
        description: "text-xs",
        wrapper: "mt-1",
      },
      sm: {
        trigger: "size-8 text-sm",
        icon: "size-4",
        title: "text-xs",
        description: "text-xs",
        wrapper: "mt-1.5",
      },
      md: {
        trigger: "size-10 text-base",
        icon: "size-5",
        title: "text-sm",
        description: "text-sm",
        wrapper: "mt-2",
      },
      lg: {
        trigger: "size-12 text-lg",
        icon: "size-6",
        title: "text-base",
        description: "text-base",
        wrapper: "mt-2.5",
      },
      xl: {
        trigger: "size-14 text-xl",
        icon: "size-7",
        title: "text-lg",
        description: "text-lg",
        wrapper: "mt-3",
      },
    },
    color: "auto",
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      size: "xs",
      class: {
        separator: "mt-3",
      },
    },
    {
      orientation: "horizontal",
      size: "sm",
      class: {
        separator: "mt-4",
      },
    },
    {
      orientation: "horizontal",
      size: "md",
      class: {
        separator: "mt-5",
      },
    },
    {
      orientation: "horizontal",
      size: "lg",
      class: {
        separator: "mt-6",
      },
    },
    {
      orientation: "horizontal",
      size: "xl",
      class: {
        separator: "mt-7",
      },
    },
    {
      orientation: "vertical",
      size: "xs",
      class: {
        separator: "top-[24px] bottom-[-16px]",
        item: "gap-1.5",
      },
    },
    {
      orientation: "vertical",
      size: "sm",
      class: {
        separator: "top-[32px] bottom-[-16px]",
        item: "gap-2",
      },
    },
    {
      orientation: "vertical",
      size: "md",
      class: {
        separator: "top-[40px] bottom-[-16px]",
        item: "gap-2.5",
      },
    },
    {
      orientation: "vertical",
      size: "lg",
      class: {
        separator: "top-[48px] bottom-[-16px]",
        item: "gap-3",
      },
    },
    {
      orientation: "vertical",
      size: "xl",
      class: {
        separator: "top-[56px] bottom-[-16px]",
        item: "gap-3.5",
      },
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
    orientation: "horizontal",
  },
});
