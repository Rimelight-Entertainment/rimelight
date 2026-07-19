import { defineTheme } from "../../utils/defineTheme"

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
