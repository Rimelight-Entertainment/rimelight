import { defineTheme } from "./defineTheme"

export const createQrCodeTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createQrCodeTheme()
