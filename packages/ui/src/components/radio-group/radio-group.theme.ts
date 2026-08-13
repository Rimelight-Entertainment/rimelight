import { defineTheme } from "../../types/component"

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
