import { colorNames } from "../../config"
import { defineTheme } from "../../types/component"

export const createCarouselTheme = (_colors: readonly string[] = colorNames) =>
  defineTheme({
    slots: ["root", "viewport", "container", "slide", "buttonPrev", "buttonNext", "dots", "dot"],
    base: {
      root: "relative w-full overflow-hidden select-none group/carousel",
      viewport: "w-full overflow-hidden cursor-grab active:cursor-grabbing",
      container: "flex backface-hidden",
      slide: "min-w-0 shrink-0 grow-0 basis-full pl-4 relative",
      buttonPrev: [
        "absolute left-4 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-sm text-foreground shadow transition-all hover:bg-background cursor-pointer",
        "opacity-0 scale-90 group-hover/carousel:opacity-100 group-hover/carousel:scale-100"
      ],
      buttonNext: [
        "absolute right-4 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-sm text-foreground shadow transition-all hover:bg-background cursor-pointer",
        "opacity-0 scale-90 group-hover/carousel:opacity-100 group-hover/carousel:scale-100"
      ],
      dots: "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 items-center",
      dot: "block size-2 rounded-full bg-foreground/20 cursor-pointer transition-all duration-350 hover:bg-foreground/45"
    },
    variants: {
      active: {
        true: { dot: "bg-foreground size-2.5" },
        false: { dot: "" }
      }
    },
    defaultVariants: {
      active: false
    }
  })

export default createCarouselTheme()
