import { defineTheme } from "../../utils/defineTheme"

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
