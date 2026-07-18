import { defineTheme } from "../../types/theme"

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
