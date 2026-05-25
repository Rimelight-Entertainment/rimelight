import { defineTheme } from "../utils/defineTheme"

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
