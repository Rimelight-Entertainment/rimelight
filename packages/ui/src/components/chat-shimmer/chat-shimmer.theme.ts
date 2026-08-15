import { defineTheme } from "../../utils/resolver"

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
