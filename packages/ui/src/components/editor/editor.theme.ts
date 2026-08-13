import { defineTheme } from "../../types/component"

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
