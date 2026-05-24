import { defineTheme } from "../utils/defineTheme"

export default defineTheme({
  slots: ["root"],
  base: {
    root: ""
  },
  variants: {
    theme: {
      flat: { root: "rl-flat" },
      light: { root: "rl-light" },
      dark: { root: "rl-dark" }
    }
  },
  defaultVariants: {}
})