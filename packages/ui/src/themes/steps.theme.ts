import { defineTheme } from "./defineTheme"

export const createStepsTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "w-full"
    },
    variants: {},
    defaultVariants: {}
  })

export default createStepsTheme()
