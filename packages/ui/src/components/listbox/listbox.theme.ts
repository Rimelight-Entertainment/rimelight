import { defineTheme } from "../../utils/resolver"

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
