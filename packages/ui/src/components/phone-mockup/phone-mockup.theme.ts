import { defineTheme } from "../../utils/defineTheme"

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
