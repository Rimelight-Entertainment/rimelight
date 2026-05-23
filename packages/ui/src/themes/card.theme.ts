import { defineTheme } from "../utils/defineTheme"

export const cardTheme = defineTheme({
  slots: ["root", "media", "header", "title", "description", "content", "footer", "overlay"],
  base: {
    root: [
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col transition-all duration-300",
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    ],
    media: "relative w-full aspect-video overflow-hidden shrink-0 bg-muted",
    header: "flex flex-col gap-1.5 p-6 shrink-0",
    title: "text-lg font-semibold leading-none tracking-tight text-foreground",
    description: "text-sm text-muted-foreground leading-relaxed",
    content: "p-6 pt-0 flex-1 leading-relaxed text-sm",
    footer: "flex items-center p-6 pt-0 mt-auto shrink-0",
    overlay: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end text-white"
  },
  variants: {
    interactive: {
      true: { root: "hover:shadow-md hover:-translate-y-0.5 cursor-pointer hover:border-primary/30" },
      false: { root: "" }
    },
    overlay: {
      true: { root: "relative aspect-square", content: "absolute inset-0 z-10" },
      false: { root: "" }
    }
  },
  defaultVariants: {
    interactive: false,
    overlay: false
  }
})

export default cardTheme
