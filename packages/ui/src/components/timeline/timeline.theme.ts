import { defineTheme } from "../../resolver";

export const RLTimelineTheme = defineTheme("timeline", {
  slots: [
    "root",
    "item",
    "container",
    "indicator",
    "indicatorIcon",
    "indicatorFallback",
    "separator",
    "wrapper",
    "date",
    "title",
    "description",
  ],
  base: {
    root: "flex gap-1.5",
    item: "group relative flex flex-1 gap-3",
    container: "relative flex items-center gap-1.5",
    indicator:
      "flex shrink-0 text-highlighted group-data-[state=completed]:text-inverted group-data-[state=active]:text-inverted",
    indicatorIcon:
      "text-highlighted group-data-[state=completed]:text-inverted group-data-[state=active]:text-inverted",
    indicatorFallback:
      "text-highlighted group-data-[state=completed]:text-inverted group-data-[state=active]:text-inverted",
    separator: "flex-1 rounded-full bg-elevated",
    wrapper: "w-full",
    date: "text-dimmed text-xs/5",
    title: "font-medium text-highlighted text-sm",
    description: "text-muted text-wrap text-sm",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex-row w-full",
        item: "flex-col",
        separator: "h-0.5",
      },
      vertical: {
        root: "flex-col",
        container: "flex-col",
        separator: "w-0.5",
      },
    },
  },
  compoundVariants: [
    {
      reverse: false,
      class: {
        indicator:
          "group-data-[state=completed]:bg-[var(--rl-bg)] group-data-[state=active]:bg-[var(--rl-bg)]",
        separator: "group-data-[state=completed]:bg-[var(--rl-bg)]",
      },
    },
    {
      reverse: true,
      class: {
        separator:
          "group-data-[state=active]:bg-[var(--rl-bg)] group-data-[state=completed]:bg-[var(--rl-bg)]",
      },
    },
    {
      orientation: "horizontal",
      size: "xs",
      class: {
        wrapper: "pe-5.5",
      },
    },
    {
      orientation: "horizontal",
      size: "sm",
      class: {
        wrapper: "pe-6",
      },
    },
    {
      orientation: "horizontal",
      size: "md",
      class: {
        wrapper: "pe-6.5",
      },
    },
    {
      orientation: "horizontal",
      size: "lg",
      class: {
        wrapper: "pe-7",
      },
    },
    {
      orientation: "horizontal",
      size: "xl",
      class: {
        wrapper: "pe-7.5",
      },
    },
    {
      orientation: "vertical",
      size: "xs",
      class: {
        wrapper: "mt-0.5 pb-5.5",
      },
    },
    {
      orientation: "vertical",
      size: "sm",
      class: {
        wrapper: "mt-1 pb-6",
      },
    },
    {
      orientation: "vertical",
      size: "md",
      class: {
        wrapper: "mt-1.5 pb-6.5",
      },
    },
    {
      orientation: "vertical",
      size: "lg",
      class: {
        wrapper: "mt-2 pb-7",
      },
    },
    {
      orientation: "vertical",
      size: "xl",
      class: {
        wrapper: "mt-2.5 pb-7.5",
      },
    },
  ],
  defaultVariants: {
    size: "md",
    orientation: "vertical",
  },
});
