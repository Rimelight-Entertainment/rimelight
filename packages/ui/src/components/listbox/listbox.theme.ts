import { defineTheme } from "../../types/theme"

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
