import { defineTheme } from "../../themes"

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
