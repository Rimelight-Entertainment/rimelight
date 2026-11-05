import { defineTheme } from "../../resolver";

export const RLDashboardSearchTheme = defineTheme("dashboard-search", {
  slots: [
    "root",
    "modal",
    "backdrop",
    "dialog",
    "header",
    "icon",
    "input",
    "close",
    "closeIcon",
    "body",
  ],
  base: {
    modal: "fixed inset-0 z-50 flex items-start justify-center sm:pt-16",
    backdrop: "fixed inset-0 bg-default/80 backdrop-blur-sm",
    dialog:
      "relative w-full h-full sm:h-[28rem] sm:max-w-3xl bg-default border border-default sm:rounded-xl shadow-2xl overflow-hidden",
    header: "flex items-center gap-2 border-b border-default px-4",
    icon: "size-5 shrink-0 text-muted",
    input: "flex-1 h-12 bg-transparent border-0 outline-none text-default placeholder:text-muted",
    close: "shrink-0 size-8 flex items-center justify-center rounded-md hover:bg-muted text-muted",
    closeIcon: "size-4",
    body: "p-4 text-sm text-muted text-center",
  },
  variants: {},
});
