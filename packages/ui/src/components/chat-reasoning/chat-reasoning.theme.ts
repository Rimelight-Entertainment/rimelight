import { defineTheme } from "../../utils/resolver"

export const createChatReasoningTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatReasoningTheme()
