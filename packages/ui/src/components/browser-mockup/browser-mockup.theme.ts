import { defineTheme } from "../../themes"

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
