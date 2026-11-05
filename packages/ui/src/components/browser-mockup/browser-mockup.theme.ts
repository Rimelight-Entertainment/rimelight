import { defineTheme } from "../../resolver";

export const RLBrowserMockupTheme = defineTheme("browser-mockup", {
  slots: [
    "root",
    "header",
    "controls",
    "dot",
    "dotClose",
    "dotMinimize",
    "dotMaximize",
    "navigation",
    "navButton",
    "navBack",
    "navForward",
    "navReload",
    "urlBar",
    "urlPrefix",
    "urlIcon",
    "urlText",
    "urlSuffix",
    "actions",
    "body",
  ],
  base: {
    root: "relative w-full overflow-hidden flex flex-col font-sans text-highlighted bg-default transition-colors",
    header:
      "flex items-center gap-3 px-4 py-2.5 border-b select-none border-default bg-elevated/40 shrink-0 transition-colors",
    controls: "flex items-center gap-2 shrink-0",
    dot: "w-3 h-3 rounded-full transition-opacity duration-150 inline-block shrink-0",
    dotClose: "",
    dotMinimize: "",
    dotMaximize: "",
    navigation: "flex items-center gap-1.5 shrink-0 text-muted",
    navButton:
      "inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-elevated hover:text-highlighted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-muted",
    navBack: "",
    navForward: "",
    navReload: "",
    urlBar:
      "flex-1 min-w-0 flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono bg-default border border-default text-muted transition-colors",
    urlPrefix: "flex items-center gap-1.5 shrink-0 text-dimmed",
    urlIcon: "w-3.5 h-3.5 shrink-0 text-dimmed",
    urlText: "truncate text-toned font-medium",
    urlSuffix: "ml-auto shrink-0 flex items-center text-dimmed",
    actions: "flex items-center gap-2 shrink-0 ml-auto",
    body: "flex-1 w-full min-w-0 bg-default overflow-auto",
  },
  variants: {
    variant: {
      outline: {
        root: "border border-default",
        header: "border-default bg-elevated/30",
        urlBar: "border-default bg-default/80",
      },
      solid: {
        root: "border border-default bg-elevated/20",
        header: "border-default bg-elevated/60",
        urlBar: "border-default bg-elevated/50",
      },
      soft: {
        root: "border-0 bg-elevated/40",
        header: "border-default/40 bg-elevated/60",
        urlBar: "border-transparent bg-default/60",
      },
      subtle: {
        root: "border border-default bg-elevated/10",
        header: "border-default/60 bg-elevated/30",
        urlBar: "border-default/60 bg-default/40",
      },
      ghost: {
        root: "border-0 bg-transparent shadow-none",
        header: "border-default/30 bg-transparent",
        urlBar: "border-default/30 bg-elevated/20",
      },
    },
    color: "auto",
    size: {
      xs: {
        header: "px-2 py-1 gap-1.5",
        dot: "w-2 h-2",
        controls: "gap-1",
        urlBar: "px-1.5 py-0.5 text-[10px]",
        urlIcon: "w-2.5 h-2.5",
        navButton: "w-4 h-4",
        body: "p-2",
      },
      sm: {
        header: "px-3 py-1.5 gap-2",
        dot: "w-2.5 h-2.5",
        controls: "gap-1.5",
        urlBar: "px-2 py-0.5 text-[11px]",
        urlIcon: "w-3 h-3",
        navButton: "w-5 h-5",
        body: "p-3",
      },
      md: {
        header: "px-4 py-2 gap-3",
        dot: "w-3 h-3",
        controls: "gap-2",
        urlBar: "px-3 py-1 text-xs",
        urlIcon: "w-3.5 h-3.5",
        navButton: "w-6 h-6",
        body: "p-4",
      },
      lg: {
        header: "px-5 py-2.5 gap-3.5",
        dot: "w-3.5 h-3.5",
        controls: "gap-2.5",
        urlBar: "px-3.5 py-1.5 text-sm",
        urlIcon: "w-4 h-4",
        navButton: "w-7 h-7",
        body: "p-6",
      },
      xl: {
        header: "px-6 py-3.5 gap-4",
        dot: "w-4 h-4",
        controls: "gap-3",
        urlBar: "px-4 py-2 text-base",
        urlIcon: "w-4.5 h-4.5",
        navButton: "w-8 h-8",
        body: "p-8",
      },
    },
    controlsVariant: {
      color: {
        dotClose: "bg-rose-500 hover:opacity-80",
        dotMinimize: "bg-amber-400 hover:opacity-80",
        dotMaximize: "bg-emerald-500 hover:opacity-80",
      },
      monochrome: {
        dotClose: "bg-inverted opacity-60 hover:opacity-100",
        dotMinimize: "bg-inverted opacity-60 hover:opacity-100",
        dotMaximize: "bg-inverted opacity-60 hover:opacity-100",
      },
      none: {
        controls: "hidden",
      },
    },
    padded: {
      true: {},
      false: {
        body: "p-0!",
      },
    },
    shadow: {
      true: {
        root: "shadow-lg shadow-black/5 dark:shadow-black/20",
      },
      false: {
        root: "shadow-none",
      },
    },
    rounded: {
      true: {
        root: "rounded-xl",
      },
      false: {
        root: "rounded-none",
      },
    },
  },
  compoundVariants: [
    {
      variant: ["outline", "subtle", "solid"],
      class: {
        root: "border-[var(--rl-border)]/40 focus-within:border-[var(--rl-border)]/60",
        header: "border-[var(--rl-border)]/30",
        urlBar: "border-[var(--rl-border)]/30 focus-within:border-[var(--rl-border)]",
      },
    },
  ],
  defaultVariants: {
    variant: "outline",
    size: "md",
    color: "primary",
    controlsVariant: "color",
    padded: true,
    shadow: true,
    rounded: true,
  },
});
