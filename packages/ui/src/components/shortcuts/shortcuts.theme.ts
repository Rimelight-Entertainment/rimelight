import { defineTheme } from "../../resolver";

export const RLShortcutsTheme = defineTheme("shortcuts", {
  slots: [
    "root",
    "dialog",
    "header",
    "title",
    "close",
    "body",
    "categorySection",
    "categoryTitle",
    "grid",
    "row",
    "info",
    "name",
    "desc",
    "keys",
    "empty",
    "footer",
  ],
  base: {
    root: "fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm",
    dialog:
      "bg-elevated border border-default rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-default",
    header: "flex items-center justify-between border-b border-default px-5 py-4",
    title: "text-base font-semibold text-highlighted m-0 leading-none",
    close:
      "text-muted hover:text-highlighted transition-colors bg-transparent border-0 cursor-pointer p-1 rounded flex items-center justify-center",
    body: "max-h-[380px] overflow-y-auto p-5 flex flex-col gap-6",
    categorySection: "flex flex-col gap-2",
    categoryTitle: "text-xs font-bold uppercase tracking-wider text-primary-500 m-0",
    grid: "flex flex-col gap-3",
    row: "flex items-center justify-between gap-4 pb-2 border-b border-default/40",
    info: "flex flex-col gap-0.5",
    name: "text-sm font-medium text-highlighted",
    desc: "text-xs text-muted",
    keys: "flex items-center gap-1",
    empty: "text-sm text-muted text-center py-4",
    footer:
      "bg-muted/50 border-t border-default px-5 py-3 flex items-center justify-end text-xs text-muted",
  },
  variants: {},
  defaultVariants: {},
});
