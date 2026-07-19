import { defineTheme } from "../../themes"

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
