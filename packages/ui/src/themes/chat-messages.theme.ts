import { defineTheme } from "./defineTheme"

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
