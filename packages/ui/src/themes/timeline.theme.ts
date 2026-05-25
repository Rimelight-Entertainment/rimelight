import { defineTheme } from "../utils/defineTheme"

export const createTimelineTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createTimelineTheme()
