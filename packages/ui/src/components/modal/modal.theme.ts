import { defineTheme } from "../../resolver";

export const modalTheme = defineTheme("modal", {
  slots: [
    "root",
    "trigger",
    "backdrop",
    "content",
    "header",
    "title",
    "description",
    "footer",
    "closeButton"
  ],
  base: {
    root: "relative inline-block",
    trigger: "",
    backdrop: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300",
    content: [
      "fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-default",
      "bg-default p-5 sm:p-6 shadow-xl transition-all duration-300 outline-none",
      "max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2"
    ],
    header: "flex flex-col gap-1.5 text-center sm:text-left mb-4",
    title: "text-lg font-semibold leading-none tracking-tight text-highlighted",
    description: "text-sm text-muted leading-relaxed",
    footer: "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6",
    closeButton: [
      "absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100",
      "focus:outline-none"
    ]
  },
  variants: {
    size: {
      sm: { content: "max-w-sm" },
      md: { content: "max-w-lg" },
      lg: { content: "max-w-2xl" },
      xl: { content: "max-w-4xl" }
    }
  },
  defaultVariants: {
    size: "md"
  }
});
