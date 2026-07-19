import { defineTheme } from "../../themes"

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
