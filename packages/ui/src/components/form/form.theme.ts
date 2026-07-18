import { defineTheme } from "../../types/theme"

export const createFormTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "space-y-6"
    },
    variants: {},
    defaultVariants: {}
  })

export default createFormTheme()
