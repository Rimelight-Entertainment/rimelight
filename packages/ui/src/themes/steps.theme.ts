import { defineTheme } from "../utils/defineTheme"

export const createStepsTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "w-full"
    },
    variants: {
      size: {
        sm: { root: "" },
        md: { root: "" },
        lg: { root: "" }
      }
    },
    defaultVariants: {
      size: "md"
    }
  })

export default createStepsTheme()
