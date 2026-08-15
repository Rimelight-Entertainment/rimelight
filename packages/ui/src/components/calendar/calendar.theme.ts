import { defineTheme } from "../../utils/resolver"

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
