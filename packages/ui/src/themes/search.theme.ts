import { defineTheme } from "../utils/defineTheme"

export const createSearchTheme = () =>
  defineTheme({
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
      "footerHint"
    ],
    base: {
      root: "relative inline-block",
      trigger:
        "flex items-center gap-xs text-neutral-400 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1.5 text-sm cursor-pointer",
      triggerIcon: "w-4 h-4",
      triggerLabel: "hidden lg:inline text-xs opacity-60",
      triggerKbd:
        "hidden lg:inline-flex items-center gap-0.5 text-[10px] bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded font-sans text-neutral-400",
      modal:
        "fixed inset-0 z-[1000] hidden items-start justify-center pt-[10vh] px-4 bg-black/70 backdrop-blur-sm",
      dialog:
        "bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col",
      header: "flex items-center border-b border-neutral-800 px-4 py-3",
      headerIcon: "text-neutral-400 w-5 h-5 mr-3",
      input:
        "bg-transparent text-white placeholder-neutral-500 focus:outline-none flex-1 text-base border-none p-0",
      close:
        "text-neutral-400 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 flex items-center justify-center",
      closeIcon: "w-5 h-5",
      results: "max-h-[350px] overflow-y-auto p-2 empty:hidden flex flex-col gap-1",
      resultItem:
        "flex flex-col gap-1 p-3 hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-neutral-700 text-left decoration-none",
      resultHeader: "flex items-center justify-between",
      resultTitle: "text-sm font-semibold text-white",
      resultBadge:
        "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono",
      resultSnippet: "text-xs text-neutral-400 line-clamp-2 m-0",
      empty: "p-6 text-center text-neutral-500 text-sm hidden",
      footer:
        "bg-neutral-950 border-t border-neutral-800 px-4 py-2 flex items-center justify-between text-[11px] text-neutral-500",
      footerHint: "flex items-center gap-1"
    },
    variants: {},
    defaultVariants: {}
  })

export default createSearchTheme()
