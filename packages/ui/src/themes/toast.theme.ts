import { defineTheme } from "../utils/defineTheme"

export const createToastTheme = () =>
  defineTheme({
    slots: ["root", "title", "description", "action", "close"],
    base: {
      root: "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all border-border bg-background text-foreground",
      title: "text-sm font-semibold",
      description: "text-xs opacity-90",
      action:
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      close:
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
    },
    variants: {
      variant: {
        default: { root: "bg-background border-border" },
        destructive: {
          root: "destructive group border-error-500/20 bg-error-500/10 text-error-700 dark:text-error-400"
        },
        success: {
          root: "border-success-500/20 bg-success-500/10 text-success-700 dark:text-success-400"
        }
      }
    },
    defaultVariants: {
      variant: "default"
    }
  })

export default createToastTheme()
