import { defineTheme } from "../../types/component"

export const createBrowserMockupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createBrowserMockupTheme()
