import { defineTheme } from "../../utils/defineTheme"

export const createCalendarTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createCalendarTheme()
