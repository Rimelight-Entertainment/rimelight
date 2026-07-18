import { defineTheme } from "../../types/theme"

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
