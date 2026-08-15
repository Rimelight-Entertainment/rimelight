import { defineTheme } from "../../utils/resolver"

export const dropdownMenuTheme = defineTheme("dropdown-menu", {
  slots: [
    "root",
    "trigger",
    "content",
    "viewport",
    "group",
    "item",
    "itemLeadingIcon",
    "itemLeadingAvatar",
    "itemLabel",
    "itemTrailing",
    "itemTrailingKbds",
    "shortcut",
    "separator",
    "label",
    "arrow"
  ],
  base: {
    root: "relative inline-block text-left",
    trigger:
      "inline-flex justify-center items-center w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    content:
      "absolute z-50 mt-1 min-w-32 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-black/5 focus:outline-none flex flex-col gap-0.5",
    viewport: "flex flex-col gap-0.5",
    group: "p-0.5 isolate flex flex-col gap-0.5",
    item: "group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none transition-colors",
    itemLeadingIcon: "shrink-0 size-4 text-muted-foreground group-hover:text-foreground",
    itemLeadingAvatar: "shrink-0 size-4 rounded-full object-cover",
    itemLabel: "truncate flex-1 text-left",
    itemTrailing: "ms-auto inline-flex gap-1.5 items-center text-xs text-muted-foreground",
    itemTrailingKbds:
      "hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono opacity-70 bg-muted px-1 rounded border border-border",
    shortcut: "ml-auto text-xs tracking-widest text-muted-foreground",
    separator: "-mx-1 my-1 h-px bg-border",
    label: "px-2 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase",
    arrow: "absolute -top-1.5 left-4 size-3 rotate-45 border-l border-t border-border bg-popover"
  },
  variants: {
    size: {
      xs: { trigger: "px-2 py-1 text-xs gap-1", item: "px-1.5 py-1 text-xs gap-1" },
      sm: { trigger: "px-2.5 py-1.5 text-xs gap-1.5", item: "px-2 py-1 text-xs gap-1.5" },
      md: { trigger: "px-3 py-2 text-sm gap-2", item: "px-2 py-1.5 text-sm gap-2" },
      lg: { trigger: "px-4 py-2.5 text-base gap-2", item: "px-3 py-2 text-base gap-2" },
      xl: { trigger: "px-5 py-3 text-lg gap-2.5", item: "px-3.5 py-2.5 text-lg gap-2.5" }
    }
  },
  defaultVariants: {
    size: "md"
  }
})
