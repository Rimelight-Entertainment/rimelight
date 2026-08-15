import { defineTheme } from "../../utils/resolver"

export const createRadioGroupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createRadioGroupTheme()
