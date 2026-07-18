import { defineTheme } from "./defineTheme"

export const createPhoneMockupTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPhoneMockupTheme()
