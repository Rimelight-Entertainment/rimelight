import { defineTheme } from "../../themes/defineTheme"

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
