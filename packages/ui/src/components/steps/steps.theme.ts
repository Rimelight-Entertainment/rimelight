import { defineTheme } from "../../themes/defineTheme"

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
