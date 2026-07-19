import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../themes"

export const createConfirmTheme = (_colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
    slots: [
      "root",
      "trigger",
      "backdrop",
      "content",
      "header",
      "title",
      "description",
      "footer",
      "cancelButton",
      "actionButton"
    ],
    base: {
      root: "relative inline-block",
      trigger: "",
      backdrop: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300",
      content: [
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border",
        "bg-background p-6 shadow-xl transition-all duration-300 outline-none",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2"
      ],
      header: "flex flex-col gap-1.5 text-center sm:text-left mb-4",
      title: "text-lg font-semibold leading-none tracking-tight text-foreground",
      description: "text-sm text-muted-foreground leading-relaxed",
      footer: "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6",
      cancelButton: "w-full sm:w-auto",
      actionButton: "w-full sm:w-auto"
    },
    variants: {
      variant: {
        default: { actionButton: "" },
        destructive: {
          actionButton: "bg-error-500 hover:bg-error-600 focus-visible:ring-error-500/50"
        }
      }
    },
    defaultVariants: {
      variant: "default"
    }
  })

export default createConfirmTheme()
