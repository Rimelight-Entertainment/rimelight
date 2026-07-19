import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../utils/defineTheme"

export const createInputPinTheme = (_colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createInputPinTheme()
