import { defineTheme } from "./defineTheme"

export const createDropdownMenuTheme = () =>
  defineTheme({
    slots: ["root", "trigger", "content", "item", "shortcut", "separator", "label"],
    base: {
      root: "relative inline-block text-left",
      trigger:
        "inline-flex justify-center w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      content:
        "absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none",
      item: "group flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:pointer-events-none disabled:opacity-50",
      shortcut: "ml-auto text-xs tracking-widest opacity-60",
      separator: "-mx-1 my-1 h-px bg-muted",
      label: "px-2 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
    },
    variants: {
      size: {
        sm: { trigger: "px-3 py-1.5 text-xs", item: "px-2 py-1 text-xs" },
        md: { trigger: "px-4 py-2 text-sm", item: "px-2 py-1.5 text-sm" },
        lg: { trigger: "px-5 py-2.5 text-base", item: "px-3 py-2 text-base" }
      }
    },
    defaultVariants: {
      size: "md"
    }
  })

export default createDropdownMenuTheme()
