import { defineTheme } from "../../types/theme"

export const createAudioTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createAudioTheme()
