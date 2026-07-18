import { defineTheme } from "../../themes/defineTheme"

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
