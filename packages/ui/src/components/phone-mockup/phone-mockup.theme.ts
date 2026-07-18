import { defineTheme } from "../../types/theme"

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
