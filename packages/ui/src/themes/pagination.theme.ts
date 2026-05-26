import { defaultColors } from "../presets/defaults"
import { defineTheme } from "../utils/defineTheme"

export const createPaginationTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "list", "item", "link", "ellipsis"],
    base: {
      root: "mx-auto flex w-full justify-center",
      list: "flex flex-row items-center gap-1",
      item: "",
      link: [
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all size-9 cursor-pointer border border-border bg-background hover:bg-muted text-foreground decoration-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      ],
      ellipsis: "flex size-9 items-center justify-center text-muted-foreground"
    },
    variants: {
      active: {
        true: { link: "border-primary bg-primary text-primary-foreground hover:bg-primary/95" },
        false: { link: "" }
      }
    },
    defaultVariants: {
      active: false
    }
  })

export default createPaginationTheme()
