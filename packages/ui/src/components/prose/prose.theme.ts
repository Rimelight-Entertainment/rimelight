import { defineTheme } from "../../types/theme"

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
