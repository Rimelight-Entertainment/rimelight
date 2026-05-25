import { defineTheme } from "../utils/defineTheme"

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
