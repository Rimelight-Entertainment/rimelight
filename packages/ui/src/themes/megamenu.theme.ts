import { defineTheme } from "../utils/defineTheme"

export const createMegamenuTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createMegamenuTheme()
