import { defineTheme } from "../../resolver"

export const toastTheme = defineTheme("toast", {
  slots: ["root", "title", "description", "action", "close"],
  base: {
    root: "group pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all border-default bg-default text-highlighted",
    title: "text-sm font-semibold",
    description: "text-xs opacity-90",
    action:
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.error]:border-muted/40 group-[.error]:hover:border-error-500/30 group-[.error]:hover:bg-error-500 group-[.error]:hover:text-white group-[.error]:focus:ring-error-500",
    close:
      "absolute right-2 top-2 rounded-md p-1 text-highlighted/50 opacity-0 transition-opacity hover:text-highlighted focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
  },
  variants: {
    variant: {
      default: { root: "bg-default border-default" },
      error: {
        root: "error group rl-color-error border-[var(--rl-border)]/20 bg-[var(--rl-bg)]/10 text-[var(--rl-text)]"
      },
      success: {
        root: "rl-color-success border-[var(--rl-border)]/20 bg-[var(--rl-bg)]/10 text-[var(--rl-text)]"
      },
      warning: {
        root: "rl-color-warning border-[var(--rl-border)]/20 bg-[var(--rl-bg)]/10 text-[var(--rl-text)]"
      },
      info: {
        root: "rl-color-info border-[var(--rl-border)]/20 bg-[var(--rl-bg)]/10 text-[var(--rl-text)]"
      }
    }
  },
  defaultVariants: {
    variant: "default"
  }
})
