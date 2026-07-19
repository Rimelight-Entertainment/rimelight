import { defineTheme } from "../../themes"

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
