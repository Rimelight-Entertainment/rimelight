import { defineTheme } from "../../utils/resolver"

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
