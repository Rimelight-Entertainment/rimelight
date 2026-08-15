import { defineTheme } from "../../utils/resolver"

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
