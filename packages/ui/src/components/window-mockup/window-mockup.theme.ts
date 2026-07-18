import { defineTheme } from "../../themes/defineTheme"

export const createWindowMockupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createWindowMockupTheme()
