import { defineTheme } from "../../resolver";

const COLORED = "border-[var(--rl-border)]/20 bg-[var(--rl-bg)]/10 text-[var(--rl-text)]";

export const RLToastTheme = defineTheme("toast", {
  slots: ["root", "icon", "body", "title", "description", "actions", "close"],
  base: {
    root: "group pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all border-default bg-default text-highlighted data-[state=closed]:pointer-events-none data-[state=closed]:translate-y-2 data-[state=closed]:opacity-0",
    icon: "size-4 shrink-0 mt-0.5",
    body: "flex min-w-0 flex-1 flex-col gap-0.5",
    title: "text-sm font-semibold",
    description: "text-xs opacity-90",
    actions: "mt-3 flex items-center justify-end gap-2",
    close:
      "absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100",
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
    color: "primary",
  },
});
