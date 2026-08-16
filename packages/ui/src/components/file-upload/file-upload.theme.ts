import { defineTheme } from "../../utils/resolver"

export const fileUploadTheme = defineTheme("file-upload", {
  slots: ["root", "input", "content", "icon", "title", "description"],
  base: {
    root: "flex flex-col items-center justify-center w-full min-h-[150px] border-2 border-dashed border-default rounded-lg bg-default/50 hover:bg-muted/30 transition-colors cursor-pointer select-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
    input: "absolute opacity-0 size-0 pointer-events-none",
    content: "flex flex-col items-center justify-center p-6 text-center gap-1.5",
    icon: "size-8 text-muted",
    title: "text-sm font-semibold text-highlighted",
    description: "text-xs text-muted"
  },
  variants: {
    disabled: {
      true: { root: "opacity-50 cursor-not-allowed pointer-events-none" }
    }
  },
  defaultVariants: {
    disabled: false
  }
})
