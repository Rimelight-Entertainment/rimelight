import { defineTheme } from "../../utils/defineTheme"

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
