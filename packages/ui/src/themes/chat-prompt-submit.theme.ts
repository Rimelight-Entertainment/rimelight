import { defineTheme } from "./defineTheme"

export const createChatPromptSubmitTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatPromptSubmitTheme()
