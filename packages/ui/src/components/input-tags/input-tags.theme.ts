import { defineTheme } from "../../themes"

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
