import { defineTheme } from "../../themes"

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
