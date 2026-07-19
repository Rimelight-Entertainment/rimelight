import { defineTheme } from "../../utils/defineTheme"

export const createLinkTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "inline-flex items-center gap-1 leading-none"
    },
    variants: {},
    defaultVariants: {}
  })

export default createLinkTheme()
