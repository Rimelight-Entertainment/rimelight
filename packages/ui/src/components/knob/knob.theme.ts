import { defineTheme } from "../../themes/defineTheme"

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
