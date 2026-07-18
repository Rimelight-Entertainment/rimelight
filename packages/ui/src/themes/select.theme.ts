import { defineTheme } from "./defineTheme"

export const createSelectTheme = () =>
  defineTheme({
    slots: ["root", "label", "trigger", "content", "item", "itemText", "itemIcon"],
    base: {
      root: "relative w-full flex flex-col gap-1.5",
      label: "text-sm font-medium text-foreground",
      trigger:
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      content:
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-background p-1 text-foreground shadow-lg transition-all w-full mt-1 max-h-60 overflow-y-auto",
      item: "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      itemText: "truncate",
      itemIcon: "ml-auto size-4"
    },
    variants: {
      size: {
        sm: { trigger: "h-8 px-2 text-xs", item: "py-1 px-1.5 text-xs" },
        md: { trigger: "h-9 px-3 text-sm", item: "py-1.5 px-2 text-sm" },
        lg: { trigger: "h-10 px-4 text-base", item: "py-2 px-2.5 text-base" }
      }
    },
    defaultVariants: {
      size: "md"
    }
  })

export default createSelectTheme()
