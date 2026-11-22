import { defineTheme } from "../../resolver";

export const RLTabsTheme = defineTheme("tabs", {
  slots: [
    "root",
    "list",
    "indicator",
    "trigger",
    "leadingIcon",
    "label",
    "trailingBadge",
    "body",
    "overflow",
    "overflowTrigger",
    "overflowLabel",
    "overflowMenu",
    "overflowItem",
    "overflowIcon",
    "overflowCheck",
    "panel",
  ],
  base: {
    root: "flex gap-2 w-full",
    list: "relative flex p-1 group items-center min-w-0",
    indicator:
      "absolute start-0 top-0 pointer-events-none transition-[translate,width,height] duration-200 ease-out translate-x-[var(--rl-indicator-x,0px)] translate-y-[var(--rl-indicator-y,0px)] w-[var(--rl-indicator-w,0px)] h-[var(--rl-indicator-h,0px)]",
    trigger:
      "group relative inline-flex items-center justify-center min-w-0 whitespace-nowrap font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 focus-visible:outline-none data-[state=inactive]:text-muted hover:data-[state=inactive]:text-highlighted",
    leadingIcon: "shrink-0",
    label: "truncate",
    trailingBadge: "shrink-0",
    body: "w-full focus-visible:outline-none",
    overflow: "relative inline-flex items-center ml-auto",
    overflowTrigger: "gap-1",
    overflowLabel: "truncate",
    overflowMenu:
      "absolute right-0 top-full mt-1 z-50 rounded-lg border border-default bg-default p-1 shadow-lg backdrop-blur-sm min-w-40 flex flex-col gap-0.5",
    overflowItem:
      "w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-between hover:bg-muted focus-visible:outline-none cursor-pointer data-[state=active]:bg-muted/80 data-[state=active]:font-medium",
    overflowIcon: "size-3.5 opacity-70",
    overflowCheck: "size-4",
    panel: "flex-1",
  },
  variants: {
    variant: {
      solid: {
        list: "bg-muted/60 rounded-lg p-1",
        trigger: "grow rounded-md data-[state=active]:text-highlighted z-10",
        indicator: "bg-default rounded-md shadow-xs",
      },
      link: {
        list: "bg-transparent border-b border-default p-0 gap-2 -mb-px",
        trigger: "rounded-md data-[state=active]:text-primary px-3 z-10",
        indicator:
          "bg-transparent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:rounded-full",
      },
    },
    orientation: {
      horizontal: {
        root: "flex-col",
        list: "w-full",
        trigger: "justify-center",
      },
      vertical: {
        root: "flex-row gap-6",
        list: "flex-col items-stretch w-48 border-r border-default p-0",
        trigger: "justify-start text-left",
      },
    },
    size: {
      xs: {
        trigger: "text-xs leading-none px-2 h-[var(--rl-size-control-xs)] gap-1",
        leadingIcon: "size-3.5",
      },
      sm: {
        trigger: "text-xs leading-none px-2.5 h-[var(--rl-size-control-sm)] gap-1.5",
        leadingIcon: "size-4",
      },
      md: {
        trigger: "text-sm leading-none px-2.5 h-[var(--rl-size-control-md)] gap-1.5",
        leadingIcon: "size-4",
      },
      lg: {
        trigger: "text-sm leading-none px-3 h-[var(--rl-size-control-lg)] gap-2",
        leadingIcon: "size-5",
      },
      xl: {
        trigger: "text-base leading-none px-3 h-[var(--rl-size-control-xl)] gap-2",
        leadingIcon: "size-5",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    orientation: "horizontal",
    size: "md",
  },
});
