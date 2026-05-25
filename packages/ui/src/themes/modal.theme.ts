import { defineTheme } from "../utils/defineTheme"

export const modalTheme = defineTheme({
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
      "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border",
      "bg-background p-6 shadow-xl transition-all duration-300 outline-none",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2"
    ],
    header: "flex flex-col gap-1.5 text-center sm:text-left mb-4",
    title: "text-lg font-semibold leading-none tracking-tight text-foreground",
    description: "text-sm text-muted-foreground leading-relaxed",
    footer: "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6",
    closeButton: [
      "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
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
})

export default modalTheme
