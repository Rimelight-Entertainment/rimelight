import { defineTheme } from "../../utils/resolver"

export const imageTheme = defineTheme({
  slots: [
    "root",
    "trigger",
    "triggerImage",
    "dialog",
    "image",
    "fileInfo",
    "download",
    "closeButton"
  ],
  base: {
    root: "relative inline-block group/image",
    trigger:
      "cursor-pointer overflow-hidden rounded-lg block hover:scale-[1.02] active:scale-95 transition-transform duration-300",
    triggerImage: "",
    dialog:
      "backdrop:bg-black/60 max-w-[98vw] sm:max-w-[95vw] w-fit max-h-[90vh] rounded-xl p-0 overflow-hidden border-0 m-auto",
    image: "object-contain max-w-full max-h-[65vh] rounded-lg",
    fileInfo: "flex items-center justify-between gap-xl px-4 pb-4 shrink-0",
    download:
      "inline-flex items-center justify-center rounded-md font-medium transition-colors outline-none h-9 px-4 py-2 text-sm gap-2 text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/10",
    closeButton:
      "inline-flex items-center justify-center size-8 rounded-full bg-background/80 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
  },
  variants: {},
  defaultVariants: {}
})
