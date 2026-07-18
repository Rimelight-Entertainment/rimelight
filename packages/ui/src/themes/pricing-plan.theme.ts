import { defineTheme } from "./defineTheme"

export const createPricingPlanTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPricingPlanTheme()
