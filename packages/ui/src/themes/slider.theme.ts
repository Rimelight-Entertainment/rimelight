import { defineTheme } from "../utils/defineTheme"

const defaultColors = ["primary", "secondary", "info", "success", "warning", "error"]

export const createSliderTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "track", "range", "thumb"],
    base: {
      root: "relative flex w-full touch-none select-none items-center",
      track: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted",
      range: "absolute h-full",
      thumb: "block size-4.5 rounded-full border border-border bg-background shadow transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
    },
    variants: {
      color: Object.fromEntries(colors.map((color) => [
        color,
        {
          range: `bg-${color}-500`,
          thumb: `focus-visible:ring-${color}-500/50 hover:border-${color}-500`
        }
      ]))
    },
    defaultVariants: {
      color: "primary"
    }
  })

export default createSliderTheme()
