import { defineTheme } from "../../utils/defineTheme"

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
