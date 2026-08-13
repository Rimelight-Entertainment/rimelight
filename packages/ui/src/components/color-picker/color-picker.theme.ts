import { defineTheme } from "../../types/component"

export const createColorPickerTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createColorPickerTheme()
