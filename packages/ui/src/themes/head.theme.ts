import { defineTheme } from "./defineTheme"

export const createHeadTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createHeadTheme()
