import { defineTheme } from "./defineTheme"

export const createChatMessageTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatMessageTheme()
