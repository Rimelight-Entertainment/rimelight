import { defineTheme } from "../utils/defineTheme"

export const createAccordionTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createAccordionTheme()
