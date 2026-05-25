import { defineTheme } from "../utils/defineTheme"

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
