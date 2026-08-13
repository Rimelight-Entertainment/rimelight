import { defineTheme } from "../../types/component"

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
