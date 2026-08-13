import { defineTheme } from "../../types/component"

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
