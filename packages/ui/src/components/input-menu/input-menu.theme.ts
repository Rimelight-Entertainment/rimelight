import { defineTheme } from "../../resolver";

export const RLInputMenuTheme = defineTheme("input-menu", {
  slots: [
    "root",
    "label",
    "wrapper",
    "trigger",
    "triggerIcon",
    "input",
    "content",
    "items",
    "item",
    "itemText",
    "itemIcon",
  ],
  base: {
    root: "relative w-full flex flex-col gap-1.5",
    label: "text-sm font-medium text-highlighted",
    wrapper: "relative w-full",
    trigger:
      "flex w-full items-center justify-between rounded-md border border-default bg-default shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    triggerIcon: "opacity-50",
    input:
      "flex w-full rounded-md border border-default bg-transparent shadow-sm transition-all placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
    content:
      "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-elevated p-1 text-highlighted shadow-md transition-all w-full mt-1 max-h-60 overflow-y-auto",
    items: "py-1",
    item: "relative flex w-full cursor-default select-none items-center rounded-sm outline-none hover:bg-accented hover:text-highlighted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    itemText: "truncate",
    itemIcon: "ml-auto size-4",
  },
  variants: {
    size: {
      xs: {
        trigger: "text-xs leading-none px-2 h-[var(--rl-size-control-xs)]",
        input: "text-xs leading-none px-2 h-[var(--rl-size-control-xs)]",
        item: "py-1 px-1.5 text-xs",
      },
      sm: {
        trigger: "text-xs leading-none px-2.5 h-[var(--rl-size-control-sm)]",
        input: "text-xs leading-none px-2.5 h-[var(--rl-size-control-sm)]",
        item: "py-1 px-1.5 text-xs",
      },
      md: {
        trigger: "text-sm leading-none px-2.5 h-[var(--rl-size-control-md)]",
        input: "text-sm leading-none px-2.5 h-[var(--rl-size-control-md)]",
        item: "py-1.5 px-2 text-sm",
      },
      lg: {
        trigger: "text-sm leading-none px-3 h-[var(--rl-size-control-lg)]",
        input: "text-sm leading-none px-3 h-[var(--rl-size-control-lg)]",
        item: "py-2 px-2.5 text-sm",
      },
      xl: {
        trigger: "text-base leading-none px-3 h-[var(--rl-size-control-xl)]",
        input: "text-base leading-none px-3 h-[var(--rl-size-control-xl)]",
        item: "py-2.5 px-3 text-base",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
