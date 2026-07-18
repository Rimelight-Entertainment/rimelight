import { defineTheme } from "./defineTheme"

export const createChatTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatTheme()
