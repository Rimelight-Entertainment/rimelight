import { defineTheme } from "../../types/theme"

export const createEditorTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createEditorTheme()
