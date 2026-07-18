import { defineTheme } from "../../types/theme"

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
