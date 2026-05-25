import { defineTheme } from "../utils/defineTheme"

export const createImageTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createImageTheme()
