import { defineTheme } from "../../utils/defineTheme"

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
