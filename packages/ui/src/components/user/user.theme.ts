import { defineTheme } from "../../types/theme"

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
