import { defineTheme } from "../../utils/resolver"

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
