import { defineTheme } from "../../types/component"

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
