import { defineTheme } from "../../resolver";

export const slideoverTheme = defineTheme("slideover", {
  slots: [
    "root",
    "trigger",
    "backdrop",
    "content",
    "header",
    "title",
    "description",
    "footer",
    "closeButton",
  ],
  base: {
    root: "relative inline-block",
    trigger: "",
    backdrop: "fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm transition-all duration-300",
    content: [
      "fixed z-[1001] bg-elevated text-highlighted p-6 shadow-2xl border-default transition-all duration-300 outline-none overflow-y-auto max-h-screen",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
    ],
    header: "flex flex-col gap-1.5 mb-4",
    title: "text-lg font-semibold leading-none tracking-tight text-highlighted",
    description: "text-sm text-muted leading-relaxed",
    footer: "flex flex-col sm:flex-row sm:justify-end gap-2 mt-6",
    closeButton: [
      "absolute right-4 top-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 text-muted hover:text-highlighted",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
    ],
  },
  variants: {
    side: {
      top: {
        content:
          "inset-x-0 top-0 border-b border-default data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
      },
      bottom: {
        content:
          "inset-x-0 bottom-0 border-t border-default data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
      },
      left: {
        content:
          "inset-y-0 left-0 right-auto h-full w-4/5 max-w-sm border-r border-default m-0 max-h-none data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
      },
      right: {
        content:
          "inset-y-0 right-0 left-auto h-full w-4/5 max-w-sm border-l border-default m-0 max-h-none data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
      },
    },
  },
  defaultVariants: {
    side: "left",
  },
});
