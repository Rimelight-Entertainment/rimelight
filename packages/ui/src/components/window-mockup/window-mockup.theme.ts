import { defineTheme } from "../../themes"

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
