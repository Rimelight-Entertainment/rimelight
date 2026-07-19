import { defineTheme } from "../../utils/defineTheme"

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
