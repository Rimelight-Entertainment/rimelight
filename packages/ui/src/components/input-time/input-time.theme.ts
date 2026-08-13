import { defineTheme } from "../../types/component"

export const createInputTimeTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createInputTimeTheme()
