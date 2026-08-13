import { defineTheme } from "../../types/component"

export const createUserTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createUserTheme()
