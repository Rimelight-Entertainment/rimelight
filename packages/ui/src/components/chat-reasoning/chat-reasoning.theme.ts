import { defineTheme } from "../../themes"

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
