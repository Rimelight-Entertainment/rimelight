import { defineTheme } from "../../utils/defineTheme"

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
