import { defineTheme } from "./defineTheme"

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
