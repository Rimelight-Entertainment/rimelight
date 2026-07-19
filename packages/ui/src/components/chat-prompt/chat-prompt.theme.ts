import { defineTheme } from "../../themes"

export const createChatPromptTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatPromptTheme()
