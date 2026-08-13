import { colorConfig } from "../../config"
import { defineTheme } from "../../types/component"

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
