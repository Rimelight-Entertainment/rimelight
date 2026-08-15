import { defineTheme } from "../../utils/resolver"

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
