import { defineTheme } from "../../types/theme"

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
