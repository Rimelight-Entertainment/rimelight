import { defineTheme } from "../../utils/resolver"

export const createChatMessageTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatMessageTheme()
