import { defineTheme } from "../../utils/resolver"

export const tableTheme = defineTheme({
  slots: [
    "root",
    "base",
    "caption",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "separator",
    "empty",
    "loading"
  ],
  base: {
    root: "relative w-full overflow-auto rounded-lg border border-border shadow-sm outline-primary/25 focus-visible:outline-3",
    base: "min-w-full overflow-clip border-collapse text-sm text-left",
    caption: "sr-only p-4 text-xs text-muted-foreground text-center",
    thead:
      "relative bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground",
    tbody:
      "isolate divide-y divide-border/60 [&>tr]:data-[selectable=true]:hover:bg-muted/30 [&>tr]:data-[selectable=true]:cursor-pointer",
    tfoot: "relative bg-muted/30 border-t border-border font-medium text-xs text-muted-foreground",
    tr: "transition-colors data-[selected=true]:bg-primary/10 data-[expanded=true]:bg-muted/40 hover:bg-muted/30",
    th: "px-4 py-3.5 text-xs font-semibold text-muted-foreground text-left uppercase tracking-wider [&:has([role=checkbox])]:pe-0",
    td: "p-4 text-sm text-foreground align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0",
    separator: "absolute z-10 start-0 w-full h-px bg-border",
    empty: "py-8 text-center text-sm text-muted-foreground",
    loading: "py-8 text-center text-sm text-muted-foreground"
  },
  variants: {
    pinned: {
      true: {
        th: "sticky bg-background/95 backdrop-blur z-10",
        td: "sticky bg-background/95 backdrop-blur z-10"
      }
    },
    sticky: {
      true: {
        thead: "sticky top-0 inset-x-0 bg-background/95 backdrop-blur z-10",
        tfoot: "sticky bottom-0 inset-x-0 bg-background/95 backdrop-blur z-10"
      },
      header: {
        thead: "sticky top-0 inset-x-0 bg-background/95 backdrop-blur z-10"
      },
      footer: {
        tfoot: "sticky bottom-0 inset-x-0 bg-background/95 backdrop-blur z-10"
      }
    },
    loading: {
      true: {
        thead:
          "after:absolute after:bottom-0 after:start-0 after:z-10 after:h-0.5 after:w-full motion-reduce:after:animate-pulse"
      }
    },
    externalScroll: {
      true: {
        root: "overflow-visible"
      }
    },
    striped: {
      true: {
        tr: "odd:bg-background even:bg-muted/20 hover:bg-muted/35"
      }
    },
    bordered: {
      true: {
        root: "border-2 border-border shadow-sm",
        tr: "border-b border-border",
        th: "border-r border-border last:border-r-0",
        td: "border-r border-border last:border-r-0"
      }
    },
    loadingAnimation: {
      "carousel": {},
      "carousel-inverse": {},
      "swing": {},
      "elastic": {}
    },
    loadingColor: {
      primary: {},
      secondary: {},
      success: {},
      info: {},
      warning: {},
      error: {},
      neutral: {}
    }
  },
  compoundVariants: [
    { loading: true, loadingColor: "primary", classNames: { thead: "after:bg-primary" } },
    { loading: true, loadingColor: "secondary", classNames: { thead: "after:bg-secondary" } },
    { loading: true, loadingColor: "success", classNames: { thead: "after:bg-success" } },
    { loading: true, loadingColor: "info", classNames: { thead: "after:bg-info" } },
    { loading: true, loadingColor: "warning", classNames: { thead: "after:bg-warning" } },
    { loading: true, loadingColor: "error", classNames: { thead: "after:bg-destructive" } },
    {
      loading: true,
      loadingColor: "neutral",
      classNames: { thead: "after:bg-muted-foreground" }
    },
    {
      loading: true,
      loadingAnimation: "carousel",
      classNames: { thead: "motion-safe:after:animate-pulse" }
    }
  ],
  defaultVariants: {
    striped: false,
    bordered: false,
    loadingColor: "primary",
    loadingAnimation: "carousel"
  }
})
