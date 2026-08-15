import { defineTheme } from "../../utils/resolver"

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
