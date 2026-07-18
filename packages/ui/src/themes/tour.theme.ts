import { defineTheme } from "./defineTheme"

export const createTourTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createTourTheme()
