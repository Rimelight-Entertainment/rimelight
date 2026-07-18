import { defineTheme } from "../../types/theme"

export const createChatShimmerTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatShimmerTheme()
