import { defineTheme } from "./defineTheme"

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
