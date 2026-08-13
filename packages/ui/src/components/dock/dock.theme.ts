import { defineTheme } from "../../types/component"

export const createDockTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDockTheme()
