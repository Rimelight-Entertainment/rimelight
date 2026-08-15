import { defineTheme } from "../../utils/resolver"

export const createKnobTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createKnobTheme()
