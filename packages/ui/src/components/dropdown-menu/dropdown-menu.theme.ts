import { defineTheme } from "../../resolver";

export const RLDropdownMenuTheme = defineTheme("dropdown-menu", {
  slots: [
    "root",
    "trigger",
    "triggerIcon",
    "body",
    "viewport",
    "group",
    "item",
    "itemLeadingIcon",
    "itemLeadingAvatar",
    "itemLabel",
    "itemTrailing",
    "itemTrailingKbds",
    "itemIndicator",
    "itemIndicatorIcon",
    "shortcut",
    "separator",
    "label",
    "arrow",
  ],
  base: {
    root: "relative inline-block text-left",
    trigger:
      "inline-flex justify-center items-center w-full rounded-md border border-default bg-default font-medium shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed data-[icon-only]:aspect-square data-[icon-only]:shrink-0 data-[icon-only]:!px-1.5 data-[icon-only]:!py-1.5",
    triggerIcon: "shrink-0",
    body: "fixed z-[99999] mt-1 top-[var(--rl-dd-top,0px)] left-[var(--rl-dd-left,auto)] right-[var(--rl-dd-right,auto)] min-w-32 rounded-md border border-default bg-elevated p-1 text-highlighted shadow-md ring-1 ring-scrim/5 focus:outline-none flex flex-col gap-0.5",
    viewport: "flex flex-col gap-0.5",
    group: "p-0.5 isolate flex flex-col gap-0.5",
    item: "group relative flex w-full items-center gap-2 rounded-md hover:bg-accented hover:text-highlighted cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none transition-colors data-[color]:text-[var(--rl-text)] data-[color]:hover:bg-[var(--rl-bg)]/10",
    itemLeadingIcon: "shrink-0 size-4 text-muted group-hover:text-highlighted",
    itemLeadingAvatar: "shrink-0 size-4 rounded-full object-cover",
    itemLabel: "truncate flex-1 text-left",
    itemTrailing: "ms-auto inline-flex gap-1.5 items-center text-xs text-muted",
    itemTrailingKbds:
      "hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono opacity-70 bg-muted px-1 rounded border border-default",
    itemIndicator:
      "shrink-0 size-4 flex items-center justify-center border border-default rounded bg-default",
    itemIndicatorIcon: "text-primary",
    shortcut: "ml-auto text-xs tracking-widest text-muted",
    separator: "-mx-1 my-1 h-px border-t border-default",
    label: "px-2 py-1.5 text-xs font-semibold tracking-wider text-muted uppercase",
    arrow: "absolute -top-1.5 left-4 size-3 rotate-45 border-l border-t border-default bg-elevated",
  },
  variants: {
    size: {
      xs: { trigger: "text-xs leading-none px-2 py-1 gap-1", item: "px-1.5 py-1 text-xs gap-1" },
      sm: {
        trigger: "text-xs leading-none px-2.5 py-1.5 gap-1.5",
        item: "px-2 py-1 text-xs gap-1.5",
      },
      md: {
        trigger: "text-sm leading-none px-2.5 py-1.5 gap-1.5",
        item: "px-2 py-1.5 text-sm gap-2",
      },
      lg: { trigger: "text-sm leading-none px-3 py-2 gap-2", item: "px-2.5 py-2 text-sm gap-2" },
      xl: {
        trigger: "text-base leading-none px-3 py-2 gap-2",
        item: "px-3 py-2.5 text-base gap-2.5",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
