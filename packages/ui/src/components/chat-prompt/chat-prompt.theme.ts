import { defineTheme } from "../../themes/defineTheme"

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
