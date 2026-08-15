import { colorNames } from "../../config"
import { defineTheme } from "../../utils/resolver"

export const createInputPinTheme = (_colors: readonly string[] = colorNames) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createInputPinTheme()
