import { defineTheme } from "../../themes"

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
