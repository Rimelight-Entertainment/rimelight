import { defineTheme } from "./defineTheme"

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
