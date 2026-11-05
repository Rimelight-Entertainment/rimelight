import { defineTheme } from "../../resolver";

export const RLCompareTheme = defineTheme("compare", {
  slots: [
    "root",
    "container",
    "before",
    "after",
    "image",
    "beforeLabel",
    "afterLabel",
    "divider",
    "handle",
    "handleIcon",
  ],
  base: {
    root: "relative select-none overflow-hidden touch-none group isolate data-[disabled]:opacity-60 data-[disabled]:cursor-not-allowed",
    container: "relative w-full h-full overflow-hidden",
    after: "w-full h-full block select-none",
    before:
      "absolute inset-0 w-full h-full block select-none pointer-events-none [clip-path:var(--rl-compare-clip,inset(0_0_0_0))]",
    image: "w-full h-full object-cover select-none pointer-events-none block",
    beforeLabel:
      "absolute z-2 pointer-events-none transition-opacity font-medium tracking-wide inline-flex items-center justify-center select-none",
    afterLabel:
      "absolute z-2 pointer-events-none transition-opacity font-medium tracking-wide inline-flex items-center justify-center select-none",
    divider: "absolute z-1 pointer-events-none transition-colors",
    handle:
      "absolute z-3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border shadow-md transition-shadow cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none touch-none group-data-[disabled]:cursor-not-allowed group-data-[disabled]:shadow-none",
    handleIcon:
      "shrink-0 transition-transform text-current pointer-events-none select-none inline-flex items-center justify-center",
  },
  variants: {
    orientation: {
      horizontal: {
        divider: "top-0 bottom-0 -translate-x-1/2 w-0.5 left-[var(--rl-compare-pos,50%)]",
        handle: "top-1/2 left-[var(--rl-compare-pos,50%)] cursor-ew-resize active:cursor-ew-resize",
      },
      vertical: {
        divider: "left-0 right-0 -translate-y-1/2 h-0.5 top-[var(--rl-compare-pos,50%)]",
        handle: "left-1/2 top-[var(--rl-compare-pos,50%)] cursor-ns-resize active:cursor-ns-resize",
      },
    },
    size: {
      xs: {
        root: "text-xs rounded",
        handle: "size-6 text-xs",
        handleIcon: "size-3",
        beforeLabel: "text-[10px] px-1.5 py-0.5 rounded",
        afterLabel: "text-[10px] px-1.5 py-0.5 rounded",
      },
      sm: {
        root: "text-xs rounded-md",
        handle: "size-7 text-xs",
        handleIcon: "size-3.5",
        beforeLabel: "text-xs px-2 py-0.5 rounded",
        afterLabel: "text-xs px-2 py-0.5 rounded",
      },
      md: {
        root: "text-sm rounded-lg",
        handle: "size-9 text-sm",
        handleIcon: "size-4",
        beforeLabel: "text-xs px-2.5 py-1 rounded-md",
        afterLabel: "text-xs px-2.5 py-1 rounded-md",
      },
      lg: {
        root: "text-base rounded-xl",
        handle: "size-11 text-base",
        handleIcon: "size-5",
        beforeLabel: "text-sm px-3 py-1 rounded-lg",
        afterLabel: "text-sm px-3 py-1 rounded-lg",
      },
      xl: {
        root: "text-lg rounded-2xl",
        handle: "size-13 text-lg",
        handleIcon: "size-6",
        beforeLabel: "text-base px-3.5 py-1.5 rounded-lg",
        afterLabel: "text-base px-3.5 py-1.5 rounded-lg",
      },
    },
    variant: {
      solid: {
        handle:
          "bg-default text-highlighted border-default shadow-lg hover:border-[var(--rl-border)] focus-visible:ring-[var(--rl-ring)]",
        divider: "bg-on-scrim/90 shadow-sm",
        beforeLabel:
          "bg-default/80 backdrop-blur-sm text-highlighted border border-default/50 shadow-sm",
        afterLabel:
          "bg-default/80 backdrop-blur-sm text-highlighted border border-default/50 shadow-sm",
      },
      outline: {
        handle:
          "bg-default text-[var(--rl-text)] border-2 border-[var(--rl-border)] shadow focus-visible:ring-[var(--rl-ring)]",
        divider: "bg-[var(--rl-bg)] shadow-sm",
        beforeLabel:
          "bg-default/90 backdrop-blur-sm text-[var(--rl-text)] border border-[var(--rl-border)]/50 shadow-sm",
        afterLabel:
          "bg-default/90 backdrop-blur-sm text-[var(--rl-text)] border border-[var(--rl-border)]/50 shadow-sm",
      },
      subtle: {
        handle:
          "bg-elevated text-muted hover:text-highlighted border border-default/60 shadow focus-visible:ring-[var(--rl-ring)]",
        divider: "bg-accented/80 shadow-xs",
        beforeLabel:
          "bg-elevated/80 backdrop-blur-sm text-muted border border-default/40 shadow-xs",
        afterLabel: "bg-elevated/80 backdrop-blur-sm text-muted border border-default/40 shadow-xs",
      },
      ghost: {
        handle:
          "bg-on-scrim/20 backdrop-blur-md text-on-scrim border border-on-scrim/30 shadow-lg hover:bg-on-scrim/30 focus-visible:ring-on-scrim",
        divider: "bg-on-scrim/70 backdrop-blur-xs",
        beforeLabel:
          "bg-scrim/40 backdrop-blur-md text-on-scrim border border-on-scrim/20 shadow-sm",
        afterLabel:
          "bg-scrim/40 backdrop-blur-md text-on-scrim border border-on-scrim/20 shadow-sm",
      },
    },
    beforeLabelPosition: {
      "top-left": { beforeLabel: "top-3 left-3" },
      "top-right": { beforeLabel: "top-3 right-3" },
      "bottom-left": { beforeLabel: "bottom-3 left-3" },
      "bottom-right": { beforeLabel: "bottom-3 right-3" },
      "top-start": { beforeLabel: "top-3 start-3" },
      "top-end": { beforeLabel: "top-3 end-3" },
      "bottom-start": { beforeLabel: "bottom-3 start-3" },
      "bottom-end": { beforeLabel: "bottom-3 end-3" },
    },
    afterLabelPosition: {
      "top-left": { afterLabel: "top-3 left-3" },
      "top-right": { afterLabel: "top-3 right-3" },
      "bottom-left": { afterLabel: "bottom-3 left-3" },
      "bottom-right": { afterLabel: "bottom-3 right-3" },
      "top-start": { afterLabel: "top-3 start-3" },
      "top-end": { afterLabel: "top-3 end-3" },
      "bottom-start": { afterLabel: "bottom-3 start-3" },
      "bottom-end": { afterLabel: "bottom-3 end-3" },
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    size: "md",
    variant: "solid",
    beforeLabelPosition: "top-left",
  },
});
