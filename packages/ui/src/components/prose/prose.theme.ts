import { defineTheme } from "../../themes/defineTheme"

export const createProseTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createProseTheme()
