import { defineTheme } from "../../resolver"

export const selectTheme = defineTheme("select", {
  slots: [
    "root",
    "label",
    "trigger",
    "leading",
    "leadingIcon",
    "leadingAvatar",
    "trailing",
    "trailingIcon",
    "trailingClear",
    "value",
    "placeholder",
    "content",
    "viewport",
    "group",
    "empty",
    "separator",
    "item",
    "itemLeadingIcon",
    "itemLeadingAvatar",
    "itemLeadingChip",
    "itemWrapper",
    "itemLabel",
    "itemDescription",
    "itemTrailingIcon",
    "input",
    "createOption"
  ],
  base: {
    root: "relative w-full flex flex-col gap-1.5",
    label: "text-sm font-medium text-highlighted",
    trigger:
      "relative group w-full inline-flex items-center justify-between rounded-md border border-default bg-default px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-75 cursor-pointer",
    leading: "inline-flex items-center gap-1.5 shrink-0 me-2",
    leadingIcon: "shrink-0 size-4 text-muted",
    leadingAvatar: "shrink-0 size-4 rounded-full object-cover",
    trailing: "inline-flex items-center gap-1.5 shrink-0 ms-auto",
    trailingIcon: "shrink-0 size-4 text-muted transition-transform duration-200",
    trailingClear: "p-0 text-muted hover:text-highlighted cursor-pointer",
    value: "truncate text-highlighted",
    placeholder: "truncate text-muted",
    content:
      "absolute z-50 left-0 right-0 min-w-[12rem] bg-default shadow-lg rounded-md border border-default overflow-hidden mt-1 flex flex-col max-h-60",
    viewport: "relative p-1 scroll-py-1 overflow-y-auto flex-1 divide-y divide-border/50",
    group: "p-1 isolate",
    empty: "p-3 text-center text-sm text-muted",
    separator: "-mx-1 my-1 h-px bg-border",
    item: "group relative w-full flex items-center justify-between select-none outline-none rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    itemLeadingIcon: "shrink-0 size-4 me-2 text-muted group-hover:text-highlighted",
    itemLeadingAvatar: "shrink-0 size-4 me-2 rounded-full object-cover",
    itemLeadingChip: "shrink-0 size-2.5 me-2 rounded-full",
    itemWrapper: "flex-1 flex flex-col min-w-0",
    itemLabel: "truncate font-normal",
    itemDescription: "truncate text-xs text-muted",
    itemTrailingIcon: "shrink-0 size-4 ms-auto text-primary",
    input:
      "w-full border-b border-default bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted",
    createOption:
      "p-2 text-sm font-medium text-primary hover:bg-accent cursor-pointer flex items-center gap-2 border-t border-default"
  },
  variants: {
    size: {
      xs: {
        trigger: "h-7 px-2 text-xs",
        item: "py-1 px-1.5 text-xs",
        input: "py-1 px-2 text-xs"
      },
      sm: {
        trigger: "h-8 px-2.5 text-xs",
        item: "py-1 px-2 text-xs",
        input: "py-1.5 px-2.5 text-xs"
      },
      md: {
        trigger: "h-9 px-3 text-sm",
        item: "py-1.5 px-2 text-sm",
        input: "py-2 px-3 text-sm"
      },
      lg: {
        trigger: "h-10 px-3.5 text-sm",
        item: "py-2 px-2.5 text-sm",
        input: "py-2.5 px-3.5 text-sm"
      },
      xl: {
        trigger: "h-11 px-4 text-base",
        item: "py-2.5 px-3 text-base",
        input: "py-3 px-4 text-base"
      }
    },
    variant: {
      outline: { trigger: "bg-default border border-default hover:bg-accent/50" },
      soft: { trigger: "bg-accent/50 border-transparent hover:bg-accent" },
      subtle: { trigger: "bg-accent border border-default hover:bg-accent/80" },
      ghost: { trigger: "bg-transparent border-transparent hover:bg-accent" },
      none: { trigger: "bg-transparent border-transparent px-0 shadow-none" }
    },
    theme: {
      dark: { root: "rl-dark" },
      light: { root: "rl-light" }
    }
  },
  defaultVariants: {
    size: "md",
    variant: "outline"
  }
})
