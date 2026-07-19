import { defineTheme } from "../../utils/defineTheme"

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
