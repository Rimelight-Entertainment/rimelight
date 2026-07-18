import { defineTheme } from "../../types/theme"

export const createSpoilerTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createSpoilerTheme()
