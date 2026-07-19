import { defineTheme } from "../../utils/defineTheme"

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
