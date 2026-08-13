import { defineTheme } from "../../types/component"

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
