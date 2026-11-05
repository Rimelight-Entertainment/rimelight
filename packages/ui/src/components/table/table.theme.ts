import { defineTheme } from "../../resolver";

export const RLTableTheme = defineTheme("table", {
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
    "empty",
    "loading",
    "trGroup",
    "tdGroup",
    "trExpanded",
    "tdExpanded",
    "toolbar",
    "resizer",
    "dragHandle",
    "col",
    "pinnedCell",
    "padRow",
    "search",
    "reorderCell",
    "reorderIcon",
    "actionsCell",
    "actionsTrigger",
    "actionsIcon",
    "toolbarActions",
    "scroller",
    "virtualScroller",
    "headerContent",
    "headerText",
    "sortButton",
    "sortIcon",
    "sortIconActive",
    "dragHandleIcon",
    "loadingContent",
    "loadingIcon",
    "emptyContent",
    "emptyIcon",
    "emptyText",
    "groupHeader",
    "groupIcon",
    "groupLabel",
    "groupValue",
    "groupCount",
  ],
  base: {
    root: "relative block w-full overflow-hidden rounded-lg border border-default shadow-sm outline-primary/25 focus-visible:outline-3",
    base: "min-w-full w-full border-separate border-spacing-0 text-sm text-left",
    caption: "sr-only p-4 text-xs text-muted text-center",
    toolbar:
      "flex items-center gap-3 px-3.5 py-3 border-b border-default bg-muted/20 overflow-x-auto",
    thead:
      "relative bg-muted/50 border-b border-default text-xs uppercase font-semibold text-muted",
    tbody: "divide-y divide-default/60",
    tfoot: "relative bg-muted/30 border-t border-default font-medium text-xs text-muted",
    tr: "relative transition-colors aria-selected:bg-primary/10 aria-expanded:bg-muted/40 data-[drop-position=top]:after:absolute data-[drop-position=top]:after:inset-x-0 data-[drop-position=top]:after:top-0 data-[drop-position=top]:after:h-0.5 data-[drop-position=top]:after:bg-primary data-[drop-position=top]:after:z-30 data-[drop-position=bottom]:after:absolute data-[drop-position=bottom]:after:inset-x-0 data-[drop-position=bottom]:after:bottom-0 data-[drop-position=bottom]:after:h-0.5 data-[drop-position=bottom]:after:bg-primary data-[drop-position=bottom]:after:z-30",
    th: "relative group/th w-[var(--rl-col-width,auto)] min-w-[var(--rl-col-min-width,0)] max-w-[var(--rl-col-max-width,none)] px-4 py-3.5 text-xs font-semibold text-muted text-left uppercase tracking-wider border-b border-default [&:has([role=checkbox])]:pe-0 data-[drop-position=left]:after:absolute data-[drop-position=left]:after:inset-y-0 data-[drop-position=left]:after:start-0 data-[drop-position=left]:after:w-0.5 data-[drop-position=left]:after:bg-primary data-[drop-position=left]:after:z-30 data-[drop-position=right]:after:absolute data-[drop-position=right]:after:inset-y-0 data-[drop-position=right]:after:end-0 data-[drop-position=right]:after:w-0.5 data-[drop-position=right]:after:bg-primary data-[drop-position=right]:after:z-30",
    td: "p-4 text-sm text-highlighted align-middle whitespace-nowrap border-b border-default/40 [&:has([role=checkbox])]:pe-0 w-[var(--rl-col-width,auto)] min-w-[var(--rl-col-min-width,0)] max-w-[var(--rl-col-max-width,none)]",
    empty: "py-8 text-center text-sm text-muted",
    loading: "py-8 text-center text-sm text-muted",
    trGroup: "bg-muted/40",
    tdGroup:
      "pe-4 ps-[var(--rl-depth-pad,1rem)] py-2 text-xs font-bold uppercase tracking-wider text-highlighted border-b border-default",
    trExpanded: "bg-muted/20 border-b border-default",
    tdExpanded: "p-4 border-b border-default",
    resizer:
      "absolute top-0 end-0 h-full w-1.5 cursor-col-resize select-none touch-none hover:bg-primary/50 transition-colors opacity-0 group-hover/th:opacity-60",
    dragHandle:
      "inline-flex items-center justify-center cursor-grab active:cursor-grabbing text-muted/50 hover:text-highlighted touch-none select-none p-1 rounded hover:bg-muted/40 transition-colors",
    col: "[width:var(--rl-col-width,auto)] [min-width:var(--rl-col-min-width,auto)] [max-width:var(--rl-col-max-width,none)]",
    pinnedCell:
      "sticky z-10 bg-default left-[var(--rl-pin-left,auto)] right-[var(--rl-pin-right,auto)]",
    padRow: "h-[var(--rl-pad,0px)] p-0 border-0",
    search: "max-w-xs min-w-[10ch] w-full",
    reorderCell: "flex items-center justify-center",
    reorderIcon: "size-4",
    actionsCell: "flex items-center justify-end",
    actionsTrigger: "aspect-square px-1.5 py-1.5 inline-flex items-center justify-center shrink-0",
    actionsIcon: "size-4",
    toolbarActions: "ml-auto flex items-center gap-2 shrink-0",
    scroller: "overflow-x-auto w-full relative",
    virtualScroller: "overflow-x-auto w-full relative max-h-[400px] overflow-y-auto",
    headerContent: "flex items-center gap-1.5",
    headerText: "flex-1 min-w-0",
    sortButton:
      "inline-flex items-center gap-1.5 hover:text-highlighted focus:outline-none transition-colors cursor-pointer group -mx-1 px-1 py-0.5 rounded",
    sortIcon: "size-3.5 transition-all shrink-0 opacity-40 group-hover:opacity-100",
    sortIconActive: "size-3.5 transition-all shrink-0 text-primary",
    dragHandleIcon: "size-3.5 opacity-40 hover:opacity-100",
    loadingContent: "flex items-center justify-center gap-2 text-muted py-4",
    loadingIcon: "size-5 animate-spin text-primary",
    emptyContent: "flex flex-col items-center justify-center py-6 gap-2 text-muted",
    emptyIcon: "size-8 opacity-40",
    emptyText: "text-sm font-medium",
    groupHeader: "flex items-center gap-2",
    groupIcon: "size-3.5 text-primary opacity-70",
    groupLabel: "text-xs uppercase text-muted font-medium",
    groupValue: "text-highlighted",
    groupCount: "ml-auto text-muted font-normal normal-case",
  },
  variants: {
    pinned: {
      true: {
        th: "sticky bg-muted z-10 left-[var(--rl-pin-left,auto)] right-[var(--rl-pin-right,auto)]",
        td: "sticky bg-default z-10 left-[var(--rl-pin-left,auto)] right-[var(--rl-pin-right,auto)]",
      },
    },
    sticky: {
      true: {
        thead: "sticky top-0 inset-x-0 bg-default z-10",
        tfoot: "sticky bottom-0 inset-x-0 bg-default z-10",
      },
      header: {
        thead: "sticky top-0 inset-x-0 bg-default z-10",
      },
      footer: {
        tfoot: "sticky bottom-0 inset-x-0 bg-default z-10",
      },
    },
    loadingBar: {
      true: {
        thead:
          "after:absolute after:bottom-0 after:start-0 after:z-10 after:h-0.5 after:w-full motion-reduce:after:w-full motion-reduce:after:animate-pulse",
      },
    },
    externalScroll: {
      true: {
        root: "overflow-visible",
      },
    },
    striped: {
      true: {
        tbody:
          "[&>tr:nth-child(even):not([data-slot=tr-group]):not([data-slot=tr-expanded])]:bg-muted/25 [&>tr:nth-child(even):not([data-slot=tr-group]):not([data-slot=tr-expanded])>td]:bg-muted/25",
      },
    },
    hoverable: {
      true: {
        tr: "hover:bg-muted/30 cursor-pointer",
      },
    },
    bordered: {
      true: {
        root: "border-2 border-default shadow-sm",
        tr: "border-b border-default",
        th: "border-r border-default last:border-r-0",
        td: "border-r border-default last:border-r-0",
      },
    },
    loadingAnimation: {
      carousel: {},
      "carousel-inverse": {},
      swing: {},
      elastic: {},
    },
    loadingColor: {
      primary: {},
      secondary: {},
      success: {},
      info: {},
      warning: {},
      error: {},
      neutral: {},
    },
  },
  compoundVariants: [
    // Loading color variants
    { loadingBar: true, loadingColor: "primary", class: { thead: "after:bg-primary" } },
    { loadingBar: true, loadingColor: "secondary", class: { thead: "after:bg-secondary" } },
    { loadingBar: true, loadingColor: "success", class: { thead: "after:bg-success" } },
    { loadingBar: true, loadingColor: "info", class: { thead: "after:bg-info" } },
    { loadingBar: true, loadingColor: "warning", class: { thead: "after:bg-warning" } },
    { loadingBar: true, loadingColor: "error", class: { thead: "after:bg-error" } },
    { loadingBar: true, loadingColor: "neutral", class: { thead: "after:bg-muted" } },
    // Loading animation variants
    {
      loadingBar: true,
      loadingAnimation: "carousel",
      class: { thead: "motion-safe:after:animate-[carousel_2s_linear_infinite]" },
    },
    {
      loadingBar: true,
      loadingAnimation: "carousel-inverse",
      class: { thead: "motion-safe:after:animate-[carousel-inverse_2s_linear_infinite]" },
    },
    {
      loadingBar: true,
      loadingAnimation: "swing",
      class: { thead: "motion-safe:after:animate-[swing_2s_ease-in-out_infinite]" },
    },
    {
      loadingBar: true,
      loadingAnimation: "elastic",
      class: { thead: "motion-safe:after:animate-[elastic_2s_ease-in-out_infinite]" },
    },
  ],
  defaultVariants: {
    striped: false,
    bordered: false,
    loadingColor: "primary",
    loadingAnimation: "carousel",
  },
});
