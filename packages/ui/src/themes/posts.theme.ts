import { defineTheme } from "../utils/defineTheme"

export const createPostsTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: "grid gap-8"
    },
    variants: {},
    defaultVariants: {}
  })

export default createPostsTheme()
