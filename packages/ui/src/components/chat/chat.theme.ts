import { defineTheme } from "../../utils/defineTheme"

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
