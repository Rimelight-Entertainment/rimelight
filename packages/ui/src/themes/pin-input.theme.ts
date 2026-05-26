import { defaultColors } from "../presets/defaults"
import { defineTheme } from "../utils/defineTheme"

export const createPinInputTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPinInputTheme()
