import { defineTheme } from "../../themes"

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
