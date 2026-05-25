import { defineTheme } from "../utils/defineTheme"

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
