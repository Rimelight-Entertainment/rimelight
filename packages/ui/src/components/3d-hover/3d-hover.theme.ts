import { defineTheme } from "../../utils/resolver"

export const create3dHoverTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default create3dHoverTheme()
