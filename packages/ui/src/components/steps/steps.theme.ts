import { defineTheme } from "../../types/component"

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
