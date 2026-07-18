import { defineTheme } from "../../types/theme"

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
