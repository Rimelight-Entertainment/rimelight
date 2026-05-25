import { defineTheme } from "../utils/defineTheme"

export const createChangelogTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChangelogTheme()
