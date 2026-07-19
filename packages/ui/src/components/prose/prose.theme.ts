import { defineTheme } from "../../themes"

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
