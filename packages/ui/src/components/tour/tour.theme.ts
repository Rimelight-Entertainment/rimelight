import { defineTheme } from "../../utils/resolver"

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
