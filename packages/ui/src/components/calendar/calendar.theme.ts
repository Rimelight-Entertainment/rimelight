import { defineTheme } from "../../types/component"

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
