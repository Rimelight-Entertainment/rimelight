import { defineTheme } from "./defineTheme"

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
