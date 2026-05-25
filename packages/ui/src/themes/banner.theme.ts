import { defineTheme } from "../utils/defineTheme"

export const createBannerTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createBannerTheme()
