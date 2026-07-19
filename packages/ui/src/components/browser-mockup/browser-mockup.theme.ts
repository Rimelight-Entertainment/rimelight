import { defineTheme } from "../../utils/defineTheme"

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
