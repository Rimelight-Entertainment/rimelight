import { defineTheme } from "../../themes/defineTheme"

export const createListboxTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createListboxTheme()
