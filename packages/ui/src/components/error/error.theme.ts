import { defineTheme } from "../../resolver";

export const RLErrorTheme = defineTheme("error", {
  slots: [
    "root",
    "card",
    "badge",
    "dot",
    "badgeLabel",
    "icon",
    "header",
    "title",
    "description",
    "body",
    "details",
    "actions",
    "footer",
  ],
  base: {
    root: "relative w-full flex items-center justify-center overflow-hidden",
    card: "relative w-full max-w-lg backdrop-blur-2xl bg-neutral-50/80 dark:bg-neutral-900/80 border border-default shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-6 overflow-hidden",
    badge:
      "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-default bg-muted/40 backdrop-blur-md",
    dot: "inline-flex rounded-full size-2 bg-[var(--rl-bg)]",
    badgeLabel: "text-xs font-mono font-bold tracking-wide uppercase text-highlighted/90",
    icon: "size-16 rounded-2xl border flex items-center justify-center shadow-sm border-[var(--rl-border)]/30 bg-[var(--rl-bg)]/10 text-[var(--rl-text)]",
    header: "flex flex-col gap-2 max-w-md",
    title: "text-2xl sm:text-3xl font-extrabold tracking-tight text-highlighted",
    description: "text-sm text-muted leading-relaxed",
    body: "w-full",
    details:
      "w-full text-left rounded-2xl border border-default/80 bg-muted/20 p-4 text-xs [&_pre]:mt-2 [&_pre]:overflow-auto [&_pre]:max-h-64 [&_pre]:font-mono [&_pre]:whitespace-pre-wrap [&_summary]:cursor-pointer [&_summary]:font-semibold",
    actions: "flex flex-col sm:flex-row items-center gap-3 w-full mt-1",
    footer: "w-full text-xs text-muted",
  },
  variants: {
    color: "auto",
    fullscreen: {
      true: { root: "min-h-[calc(100vh-8rem)] p-4 sm:p-6 lg:p-8" },
      false: { root: "" },
    },
  },
  defaultVariants: {
    color: "error",
    fullscreen: true,
  },
});
