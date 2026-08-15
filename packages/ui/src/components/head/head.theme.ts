import { defineTheme } from "../../utils/resolver"

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
