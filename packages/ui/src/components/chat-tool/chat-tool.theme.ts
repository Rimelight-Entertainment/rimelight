import { defineTheme } from "../../types/component"

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
