import { defineTheme } from "../../types/theme"

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
