import { defineTheme } from "../../types/component"

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
