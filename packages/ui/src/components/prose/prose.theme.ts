import { defineTheme } from "../../utils/defineTheme"

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
