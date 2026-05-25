import { defineTheme } from "../utils/defineTheme"

export const createGalleryTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createGalleryTheme()
