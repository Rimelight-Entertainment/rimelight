import { defineTheme } from "../../utils/defineTheme"

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
