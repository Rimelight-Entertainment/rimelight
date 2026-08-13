import { defineTheme } from "../../types/component"

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
