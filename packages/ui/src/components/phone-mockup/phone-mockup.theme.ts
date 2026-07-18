import { defineTheme } from "../../themes/defineTheme"

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
