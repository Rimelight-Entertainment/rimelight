import { defineTheme } from "../../types/component"

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
