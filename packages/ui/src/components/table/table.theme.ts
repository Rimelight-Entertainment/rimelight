import { defineTheme } from "../../resolver"

export const tableTheme = defineTheme("table", {
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
    "loading",
    "trGroup",
    "tdGroup",
    "trExpanded",
    "tdExpanded",
    "toolbar",
    "resizer",
    "dragHandle"
  ],
  base: {
    root: "relative block w-full overflow-hidden rounded-lg border border-default shadow-sm outline-primary/25 focus-visible:outline-3",
    base: "min-w-full w-full border-separate border-spacing-0 text-sm text-left",
    caption: "sr-only p-4 text-xs text-muted text-center",
    toolbar:
      "flex items-center gap-3 px-3.5 py-3 border-b border-default bg-muted/20 overflow-x-auto",
    thead:
      "relative bg-muted/50 border-b border-default text-xs uppercase font-semibold text-muted",
    tbody:
      "divide-y divide-default/60 [&>tr]:data-[selectable=true]:hover:bg-muted/30 [&>tr]:data-[selectable=true]:cursor-pointer",
    tfoot: "relative bg-muted/30 border-t border-default font-medium text-xs text-muted",
    tr: "relative transition-colors data-[selected=true]:bg-primary/10 data-[expanded=true]:bg-muted/40 data-[drop-position=top]:after:absolute data-[drop-position=top]:after:inset-x-0 data-[drop-position=top]:after:top-0 data-[drop-position=top]:after:h-0.5 data-[drop-position=top]:after:bg-primary data-[drop-position=top]:after:z-30 data-[drop-position=bottom]:after:absolute data-[drop-position=bottom]:after:inset-x-0 data-[drop-position=bottom]:after:bottom-0 data-[drop-position=bottom]:after:h-0.5 data-[drop-position=bottom]:after:bg-primary data-[drop-position=bottom]:after:z-30",
    th: "relative group/th px-4 py-3.5 text-xs font-semibold text-muted text-left uppercase tracking-wider border-b border-default [&:has([role=checkbox])]:pe-0 data-[drop-position=left]:after:absolute data-[drop-position=left]:after:inset-y-0 data-[drop-position=left]:after:start-0 data-[drop-position=left]:after:w-0.5 data-[drop-position=left]:after:bg-primary data-[drop-position=left]:after:z-30 data-[drop-position=right]:after:absolute data-[drop-position=right]:after:inset-y-0 data-[drop-position=right]:after:end-0 data-[drop-position=right]:after:w-0.5 data-[drop-position=right]:after:bg-primary data-[drop-position=right]:after:z-30",
    td: "p-4 text-sm text-highlighted align-middle whitespace-nowrap border-b border-default/40 [&:has([role=checkbox])]:pe-0",
    separator: "absolute z-10 start-0 w-full h-px bg-neutral-200",
    empty: "py-8 text-center text-sm text-muted",
    loading: "py-8 text-center text-sm text-muted",
    trGroup: "bg-muted/40",
    tdGroup:
      "px-4 py-2 text-xs font-bold uppercase tracking-wider text-highlighted border-b border-default",
    trExpanded: "bg-muted/20 border-b border-default",
    tdExpanded: "p-4 border-b border-default",
    resizer:
      "absolute top-0 end-0 h-full w-1.5 cursor-col-resize select-none touch-none hover:bg-primary/50 transition-colors opacity-0 group-hover/th:opacity-60",
    dragHandle:
      "inline-flex items-center justify-center cursor-grab active:cursor-grabbing text-muted/50 hover:text-highlighted touch-none select-none p-1 rounded hover:bg-muted/40 transition-colors"
  },
  variants: {
    pinned: {
      true: {
        th: "sticky bg-muted z-10",
        td: "sticky bg-default z-10"
      }
    },
    sticky: {
      true: {
        thead: "sticky top-0 inset-x-0 bg-default z-10",
        tfoot: "sticky bottom-0 inset-x-0 bg-default z-10"
      },
      header: {
        thead: "sticky top-0 inset-x-0 bg-default z-10"
      },
      footer: {
        tfoot: "sticky bottom-0 inset-x-0 bg-default z-10"
      }
    },
    loading: {
      true: {
        thead:
          "after:absolute after:bottom-0 after:start-0 after:z-10 after:h-0.5 after:w-full motion-reduce:after:w-full motion-reduce:after:animate-pulse"
      }
    },
    externalScroll: {
      true: {
        root: "overflow-visible"
      }
    },
    striped: {
      true: {
        tbody:
          "[&>tr:nth-child(even):not([data-slot=tr-group]):not([data-slot=tr-expanded])]:bg-muted/25 [&>tr:nth-child(even):not([data-slot=tr-group]):not([data-slot=tr-expanded])>td]:bg-muted/25"
      }
    },
    hoverable: {
      true: {
        tr: "hover:bg-muted/30 cursor-pointer"
      }
    },
    bordered: {
      true: {
        root: "border-2 border-default shadow-sm",
        tr: "border-b border-default",
        th: "border-r border-default last:border-r-0",
        td: "border-r border-default last:border-r-0"
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
    // Loading color variants
    { loading: true, loadingColor: "primary", classNames: { thead: "after:bg-primary" } },
    { loading: true, loadingColor: "secondary", classNames: { thead: "after:bg-secondary" } },
    { loading: true, loadingColor: "success", classNames: { thead: "after:bg-success" } },
    { loading: true, loadingColor: "info", classNames: { thead: "after:bg-info" } },
    { loading: true, loadingColor: "warning", classNames: { thead: "after:bg-warning" } },
    { loading: true, loadingColor: "error", classNames: { thead: "after:bg-destructive" } },
    { loading: true, loadingColor: "neutral", classNames: { thead: "after:bg-muted" } },
    // Loading animation variants
    {
      loading: true,
      loadingAnimation: "carousel",
      classNames: { thead: "motion-safe:after:animate-[carousel_2s_linear_infinite]" }
    },
    {
      loading: true,
      loadingAnimation: "carousel-inverse",
      classNames: { thead: "motion-safe:after:animate-[carousel-inverse_2s_linear_infinite]" }
    },
    {
      loading: true,
      loadingAnimation: "swing",
      classNames: { thead: "motion-safe:after:animate-[swing_2s_ease-in-out_infinite]" }
    },
    {
      loading: true,
      loadingAnimation: "elastic",
      classNames: { thead: "motion-safe:after:animate-[elastic_2s_ease-in-out_infinite]" }
    }
  ],
  defaultVariants: {
    striped: false,
    bordered: false,
    loadingColor: "primary",
    loadingAnimation: "carousel"
  }
})
