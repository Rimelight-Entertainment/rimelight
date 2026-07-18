import { defineTheme } from "./defineTheme"

export const createChatToolTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatToolTheme()
