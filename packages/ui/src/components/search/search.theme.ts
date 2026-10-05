import { defineTheme } from "../../resolver";

export const RLSearchTheme = defineTheme("search", {
  slots: [
    "root",
    "trigger",
    "triggerIcon",
    "triggerLabel",
    "triggerKbd",
    "modal",
    "dialog",
    "header",
    "headerIcon",
    "input",
    "close",
    "closeIcon",
    "results",
    "resultItem",
    "resultHeader",
    "resultTitle",
    "resultBadge",
    "resultSnippet",
    "empty",
    "footer",
    "kbdFooter",
  ],
  base: {
    root: "relative inline-block",
    trigger:
      "flex items-center gap-xs text-muted hover:text-highlighted transition-colors bg-default border border-default rounded-full px-3 py-1.5 text-sm cursor-pointer",
    triggerIcon: "w-4 h-4",
    triggerLabel: "hidden lg:inline text-xs opacity-60",
    triggerKbd:
      "hidden lg:inline-flex items-center gap-0.5 text-[10px] bg-muted border border-default px-1.5 py-0.5 rounded font-sans text-muted",
    modal:
      "fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm",
    dialog:
      "bg-elevated border border-default rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-default",
    header: "flex items-center border-b border-default px-5 py-4 gap-3",
    headerIcon: "text-muted size-4 shrink-0",
    input:
      "bg-transparent text-highlighted placeholder-muted focus:outline-none flex-1 text-sm border-none p-0",
    close:
      "text-muted hover:text-highlighted transition-colors bg-transparent border-0 cursor-pointer p-1 rounded flex items-center justify-center shrink-0",
    closeIcon: "size-4",
    results: "max-h-[380px] overflow-y-auto p-2 empty:hidden flex flex-col gap-1",
    resultItem:
      "flex flex-col gap-1 p-3 hover:bg-accented rounded-lg transition-colors border border-transparent hover:border-default text-left decoration-none",
    resultHeader: "flex items-center justify-between",
    resultTitle: "text-sm font-semibold text-highlighted",
    resultBadge:
      "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted font-mono",
    resultSnippet: "text-xs text-muted line-clamp-2 m-0",
    empty: "p-6 text-center text-muted text-sm block",
    footer:
      "bg-muted/50 border-t border-default px-5 py-3 flex items-center justify-between text-xs text-muted",
    kbdFooter:
      "bg-muted border border-default rounded px-1.5 py-0.5 text-[11px] text-muted font-mono ml-1 mr-1",
  },
  variants: {},
  defaultVariants: {},
});
