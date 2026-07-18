import { defaultColors } from "../../presets/defaults"
import { defineTheme } from "../../themes/defineTheme"

export const createInputPinTheme = (_colors: readonly string[] = defaultColors) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createInputPinTheme()
