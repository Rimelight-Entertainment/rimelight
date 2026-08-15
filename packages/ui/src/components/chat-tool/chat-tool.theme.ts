import { defineTheme } from "../../utils/resolver"

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
