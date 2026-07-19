import { defineTheme } from "../../themes"

export const createTableTheme = () =>
  defineTheme({
    slots: ["root", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption"],
    base: {
      root: "relative w-full overflow-auto rounded-lg border border-border shadow-sm",
      table: "w-full text-sm text-left border-collapse",
      thead: "bg-muted/50 border-b border-border",
      tbody: "divide-y divide-border",
      tfoot: "bg-muted/30 border-t border-border font-medium",
      tr: "transition-colors hover:bg-muted/30",
      th: "p-4 text-xs font-semibold uppercase text-muted-foreground",
      td: "p-4 text-foreground align-middle",
      caption: "p-4 text-xs text-muted-foreground text-center"
    },
    variants: {
      striped: {
        true: { tr: "odd:bg-background even:bg-muted/20 hover:bg-muted/35" }
      },
      bordered: {
        true: {
          root: "border-2 border-border",
          tr: "border-b border-border",
          th: "border-r border-border last:border-r-0",
          td: "border-r border-border last:border-r-0"
        }
      }
    },
    defaultVariants: {
      striped: false,
      bordered: false
    }
  })

export default createTableTheme()
