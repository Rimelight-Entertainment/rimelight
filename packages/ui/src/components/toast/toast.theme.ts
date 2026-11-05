import { defineTheme } from "../../resolver";

const COLORED = "border-[var(--rl-border)]/20 bg-[var(--rl-bg)]/10 text-[var(--rl-text)]";

export const RLToastTheme = defineTheme("toast", {
  slots: ["root", "title", "description", "action", "close"],
  base: {
    root: "group pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all border-default bg-default text-highlighted",
    title: "text-sm font-semibold",
    description: "text-xs opacity-90",
    action:
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.error]:border-muted/40 group-[.error]:hover:border-error-500/30 group-[.error]:hover:bg-error-500 group-[.error]:hover:text-inverted group-[.error]:focus:ring-error-500",
    close:
      "absolute right-2 top-2 rounded-md p-1 text-highlighted/50 opacity-0 transition-opacity hover:text-highlighted focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
  },
  variants: {
    color: "auto",
  },
  compoundVariants: [
    { color: "primary", class: { root: COLORED } },
    { color: "secondary", class: { root: COLORED } },
    { color: "info", class: { root: COLORED } },
    { color: "success", class: { root: COLORED } },
    { color: "warning", class: { root: COLORED } },
    { color: "error", class: { root: COLORED } },
    { color: "commentary", class: { root: COLORED } },
    { color: "ideation", class: { root: COLORED } },
    { color: "source", class: { root: COLORED } },
  ],
  defaultVariants: {
    color: "neutral",
  },
});
