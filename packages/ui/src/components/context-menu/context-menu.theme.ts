import { defineTheme } from "../../resolver";

export type RLContextMenuSlot =
  | "root"
  | "trigger"
  | "overlay"
  | "positioner"
  | "content"
  | "group"
  | "groupLabel"
  | "item"
  | "itemLeading"
  | "itemLeadingIcon"
  | "itemWrapper"
  | "itemLabel"
  | "itemDescription"
  | "itemTrailing"
  | "itemKbds"
  | "itemKbd"
  | "itemIndicator"
  | "itemSubIndicator"
  | "separator";

export type RLContextMenuClasses = Record<RLContextMenuSlot, string>;

export const RLContextMenuTheme = defineTheme("context-menu", {
  slots: [
    "root",
    "trigger",
    "overlay",
    "positioner",
    "content",
    "group",
    "groupLabel",
    "item",
    "itemLeading",
    "itemLeadingIcon",
    "itemWrapper",
    "itemLabel",
    "itemDescription",
    "itemTrailing",
    "itemKbds",
    "itemKbd",
    "itemIndicator",
    "itemSubIndicator",
    "separator",
  ],
  base: {
    root: "contents",
    trigger:
      "select-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    overlay: "fixed inset-0 z-50 bg-transparent",
    positioner: "fixed z-50 outline-none",
    content:
      "min-w-44 rounded-lg border border-default bg-elevated p-1 text-highlighted shadow-lg ring-1 ring-black/5 focus:outline-none flex flex-col gap-0.5 select-none",
    group: "flex flex-col gap-0.5",
    groupLabel: "px-2 py-1 text-xs font-semibold tracking-wider text-muted select-none",
    item: "group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left outline-none cursor-pointer select-none transition-colors hover:bg-accented hover:text-highlighted data-[highlighted]:bg-accented data-[highlighted]:text-highlighted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[danger]:text-error-600 data-[danger]:hover:bg-error-500/10 data-[danger]:data-[highlighted]:bg-error-500/10",
    itemLeading:
      "inline-flex shrink-0 items-center justify-center text-muted group-hover:text-highlighted group-data-[highlighted]:text-highlighted group-data-[danger]:text-error-600",
    itemLeadingIcon: "shrink-0 size-4",
    itemWrapper: "flex min-w-0 flex-1 flex-col text-left",
    itemLabel: "truncate font-normal leading-tight",
    itemDescription: "truncate text-xs text-muted leading-tight mt-0.5",
    itemTrailing: "ms-auto inline-flex shrink-0 items-center gap-1.5 text-xs text-muted",
    itemKbds: "inline-flex items-center gap-0.5",
    itemKbd:
      "inline-flex items-center justify-center text-[10px] font-mono opacity-80 bg-muted px-1 py-0.5 rounded border border-default leading-none",
    itemIndicator: "inline-flex shrink-0 items-center justify-center size-4 text-primary-500",
    itemSubIndicator: "inline-flex shrink-0 items-center justify-center size-4 text-muted",
    separator: "-mx-1 my-1 h-px border-t border-default",
  },
  variants: {
    size: {
      sm: {
        content: "min-w-36 p-1",
        groupLabel: "px-1.5 py-1 text-[11px]",
        item: "px-1.5 py-1 text-xs gap-1.5",
        itemLeadingIcon: "size-3.5",
        itemDescription: "text-[11px]",
        itemIndicator: "size-3.5",
        itemSubIndicator: "size-3.5",
      },
      md: {
        content: "min-w-44 p-1",
        groupLabel: "px-2 py-1 text-xs",
        item: "px-2 py-1.5 text-sm gap-2",
        itemLeadingIcon: "size-4",
        itemDescription: "text-xs",
        itemIndicator: "size-4",
        itemSubIndicator: "size-4",
      },
      lg: {
        content: "min-w-52 p-1.5",
        groupLabel: "px-2.5 py-1.5 text-xs",
        item: "px-2.5 py-2 text-base gap-2.5",
        itemLeadingIcon: "size-4.5",
        itemDescription: "text-xs",
        itemIndicator: "size-4.5",
        itemSubIndicator: "size-4.5",
      },
    },
    disabled: {
      true: {
        trigger: "pointer-events-none opacity-50 cursor-not-allowed",
        item: "pointer-events-none opacity-50 cursor-not-allowed",
      },
      false: {},
    },
  },
  defaultVariants: {
    size: "md",
    disabled: false,
  },
});
