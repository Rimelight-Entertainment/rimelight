import { defineTheme } from "../../utils/resolver"

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
