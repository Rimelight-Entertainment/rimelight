import { defineTheme } from "./defineTheme"

export const createLayoutGridTheme = () =>
  defineTheme({
    slots: ["root", "overlay", "container", "columns"],
    base: {
      root: "",
      overlay: "fixed top-0 left-0 w-full h-full pointer-events-none",
      container: "h-full mx-auto",
      columns: "grid h-full"
    },
    variants: {},
    defaultVariants: {}
  })

export default createLayoutGridTheme()
