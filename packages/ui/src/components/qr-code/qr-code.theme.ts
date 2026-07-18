import { defineTheme } from "../../types/theme"

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
