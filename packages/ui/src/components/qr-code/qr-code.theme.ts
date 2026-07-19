import { defineTheme } from "../../themes"

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
