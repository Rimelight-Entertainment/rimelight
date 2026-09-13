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
    "tdExpanded"
  ],
  base: {
    root: "relative w-full overflow-auto rounded-lg border border-default shadow-sm outline-primary/25 focus-visible:outline-3",
    base: "min-w-full overflow-clip border-collapse text-sm text-left",
    caption: "sr-only p-4 text-xs text-muted text-center",
    thead:
      "relative bg-muted/50 border-b border-default text-xs uppercase font-semibold text-muted",
    tbody:
      "divide-y divide-default/60 [&>tr]:data-[selectable=true]:hover:bg-muted/30 [&>tr]:data-[selectable=true]:cursor-pointer",
    tfoot: "relative bg-muted/30 border-t border-default font-medium text-xs text-muted",
    tr: "transition-colors data-[selected=true]:bg-primary/10 data-[expanded=true]:bg-muted/40",
    th: "px-4 py-3.5 text-xs font-semibold text-muted text-left uppercase tracking-wider [&:has([role=checkbox])]:pe-0",
    td: "p-4 text-sm text-highlighted align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0",
    separator: "absolute z-10 start-0 w-full h-px bg-neutral-200",
    empty: "py-8 text-center text-sm text-muted",
    loading: "py-8 text-center text-sm text-muted",
    trGroup: "bg-muted/40",
    tdGroup: "px-4 py-2 text-xs font-bold uppercase tracking-wider text-highlighted",
    trExpanded: "bg-muted/20 border-b border-default",
    tdExpanded: "p-4"
  },
  variants: {
    pinned: {
      true: {
        th: "sticky bg-default z-10",
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
          "[&>tr:not([data-slot=tr-group]):not([data-slot=tr-expanded])]:odd:bg-default [&>tr:not([data-slot=tr-group]):not([data-slot=tr-expanded])]:even:bg-muted/20"
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
    // carousel: left-to-right sweep  (keyframe: @keyframes carousel { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} })
    {
      loading: true,
      loadingAnimation: "carousel",
      classNames: { thead: "motion-safe:after:animate-[carousel_2s_linear_infinite]" }
    },
    // carousel-inverse: right-to-left sweep
    {
      loading: true,
      loadingAnimation: "carousel-inverse",
      classNames: { thead: "motion-safe:after:animate-[carousel-inverse_2s_linear_infinite]" }
    },
    // swing: pendulum back-and-forth
    {
      loading: true,
      loadingAnimation: "swing",
      classNames: { thead: "motion-safe:after:animate-[swing_2s_ease-in-out_infinite]" }
    },
    // elastic: springy bounce
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
