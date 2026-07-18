import { defineTheme } from "../../types/theme"

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
