import { defineTheme } from "../../types/theme"

export const createChatMessagesTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatMessagesTheme()
