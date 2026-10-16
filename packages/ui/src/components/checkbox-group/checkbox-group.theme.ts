import { defineTheme } from "../../resolver";

export const RLCheckboxGroupTheme = defineTheme("checkbox-group", {
  slots: ["root", "fieldset", "legend", "item"],
  base: {
    root: "relative",
    fieldset: "flex gap-x-2",
    legend: "mb-1 block font-medium text-default",
    item: "",
  },
  variants: {
    orientation: {
      horizontal: {
        fieldset: "flex-row",
      },
      vertical: {
        fieldset: "flex-col",
      },
    },
    color: "auto",
    variant: {
      list: {
        fieldset: "flex-wrap",
      },
      card: {
        fieldset: "flex-wrap",
      },
      table: {
        item: [
          "border border-default has-aria-disabled:cursor-not-allowed hover:not-has-disabled:not-has-aria-disabled:not-has-focus-visible:not-has-data-[state=checked]:bg-elevated/50",
          "transition-colors",
        ],
      },
    },
    size: {
      xs: {
        fieldset: "gap-y-0.5",
        legend: "text-xs",
      },
      sm: {
        fieldset: "gap-y-0.5",
        legend: "text-xs",
      },
      md: {
        fieldset: "gap-y-1",
        legend: "text-sm",
      },
      lg: {
        fieldset: "gap-y-1",
        legend: "text-sm",
      },
      xl: {
        fieldset: "gap-y-1.5",
        legend: "text-base",
      },
    },
    required: {
      true: {
        legend: "after:content-['*'] after:ms-0.5 after:text-error",
      },
    },
    highlight: {
      true: {},
      false: {},
    },
    disabled: {
      true: {},
    },
  },
  compoundVariants: [
    {
      variant: "table",
      class: {
        item: "outline-[var(--rl-ring)]/25 has-focus-visible:outline-3 not-has-disabled:has-focus-visible:border-[var(--rl-border)] has-focus-visible:z-[1] has-data-[state=checked]:bg-[var(--rl-bg)]/10 has-data-[state=checked]:border-[var(--rl-border)]/50 has-data-[state=checked]:z-[2]",
      },
    },
    {
      variant: "table",
      highlight: false,
      class: {
        item: "hover:not-has-disabled:not-has-aria-disabled:not-has-focus-visible:not-has-data-[state=checked]:border-accented hover:not-has-disabled:not-has-aria-disabled:not-has-focus-visible:not-has-data-[state=checked]:z-[1]",
      },
    },
    { size: "xs", variant: "table", class: { item: "p-2.5" } },
    { size: "sm", variant: "table", class: { item: "p-3" } },
    { size: "md", variant: "table", class: { item: "p-3.5" } },
    { size: "lg", variant: "table", class: { item: "p-4" } },
    { size: "xl", variant: "table", class: { item: "p-4.5" } },
    {
      orientation: "horizontal",
      variant: "table",
      class: {
        item: "first-of-type:rounded-s-lg last-of-type:rounded-e-lg",
        fieldset: "gap-0 -space-x-px",
      },
    },
    {
      orientation: "vertical",
      variant: "table",
      class: {
        item: "first-of-type:rounded-t-lg last-of-type:rounded-b-lg",
        fieldset: "gap-0 -space-y-px",
      },
    },
    {
      color: "neutral",
      variant: "table",
      class: {
        item: "has-data-[state=checked]:bg-elevated has-data-[state=checked]:border-inverted/50 has-data-[state=checked]:z-[2]",
      },
    },
    {
      variant: "table",
      disabled: true,
      class: {
        item: "cursor-not-allowed",
      },
    },
  ],
  defaultVariants: {
    highlight: false,
    size: "md",
    variant: "list",
    color: "primary",
    orientation: "vertical",
  },
});
