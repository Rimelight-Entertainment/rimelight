import { defineTheme } from "../../themes/defineTheme"

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
