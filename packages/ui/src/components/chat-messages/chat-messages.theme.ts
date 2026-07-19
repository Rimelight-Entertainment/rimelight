import { defineTheme } from "../../themes"

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
