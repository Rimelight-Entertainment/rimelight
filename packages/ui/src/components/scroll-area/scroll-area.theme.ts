import { defineTheme } from "../../types/theme"

export const createScrollAreaTheme = () =>
  defineTheme({
    slots: ["root", "viewport", "scrollbar", "thumb"],
    base: {
      root: "relative overflow-hidden w-full",
      viewport:
        "h-full w-full rounded-[inherit] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
      scrollbar:
        "absolute flex user-select-none touch-action-none p-0.5 bg-transparent transition-colors duration-150 ease-out hover:bg-muted/10",
      thumb: "relative flex-1 rounded-full bg-border transition-colors hover:bg-muted-foreground/45"
    },
    variants: {
      orientation: {
        vertical: { scrollbar: "right-0 top-0 bottom-0 w-2.5 flex-col" },
        horizontal: { scrollbar: "bottom-0 left-0 right-0 h-2.5 flex-row" },
        both: { scrollbar: "" }
      }
    },
    defaultVariants: {
      orientation: "vertical"
    }
  })

export default createScrollAreaTheme()
