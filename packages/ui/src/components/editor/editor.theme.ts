import { defineTheme } from "../../utils/resolver"

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
