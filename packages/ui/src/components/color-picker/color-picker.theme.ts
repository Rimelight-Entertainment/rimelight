import { defineTheme } from "../../utils/resolver"

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
