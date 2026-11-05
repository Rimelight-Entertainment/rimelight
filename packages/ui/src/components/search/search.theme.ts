import { defineTheme } from "../../resolver";

export const RLSearchTheme = defineTheme("search", {
  slots: [
    "root",
    "trigger",
    "modal",
    "dialog",
    "header",
    "headerIcon",
    "inputRoot",
    "input",
    "inputActions",
    "loadingIcon",
    "results",
    "resultItem",
    "resultHeader",
    "resultTitle",
    "resultBadge",
    "resultSnippet",
    "empty",
    "footer",
    "footerKeys",
  ],
  base: {
    root: "relative inline-block",
    trigger: "cursor-pointer",
    modal:
      "fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4 bg-scrim/60 backdrop-blur-sm",
    dialog:
      "bg-elevated border border-default rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-default",
    header: "flex items-center border-b border-default px-5 py-4 gap-3",
    headerIcon: "text-muted size-4 shrink-0",
    inputRoot:
      "relative flex items-center w-full !bg-transparent !border-none !shadow-none !p-0 !ring-0",
    input:
      "w-full bg-transparent px-3 py-1 text-sm outline-none text-highlighted placeholder:text-muted",
    inputActions: "flex items-center gap-2",
    loadingIcon: "size-4 animate-spin text-muted",
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
    footerKeys: "flex items-center gap-1",
  },
});
