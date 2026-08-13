import { defineTheme } from "../../types/component"

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
