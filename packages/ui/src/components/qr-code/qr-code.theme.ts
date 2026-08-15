import { defineTheme } from "../../utils/resolver"

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
