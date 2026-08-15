import { defineTheme } from "../../utils/resolver"

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
