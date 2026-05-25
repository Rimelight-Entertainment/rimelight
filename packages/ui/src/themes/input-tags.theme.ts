import { defineTheme } from "../utils/defineTheme"

export const createInputTagsTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createInputTagsTheme()
