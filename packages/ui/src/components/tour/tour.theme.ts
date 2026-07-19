import { defineTheme } from "../../themes"

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
