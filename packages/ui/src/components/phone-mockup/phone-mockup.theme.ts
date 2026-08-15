import { defineTheme } from "../../utils/resolver"

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
