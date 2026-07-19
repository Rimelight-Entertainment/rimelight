import { defineTheme } from "../../themes"

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
