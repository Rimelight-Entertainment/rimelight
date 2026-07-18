import { defineTheme } from "./defineTheme"

export const createPasswordTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPasswordTheme()
