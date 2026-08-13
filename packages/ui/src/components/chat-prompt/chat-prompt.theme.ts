import { defineTheme } from "../../types/component"

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
