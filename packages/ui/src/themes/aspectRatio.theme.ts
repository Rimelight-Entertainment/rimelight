import { defineTheme } from "../utils/defineTheme"

export const aspectRatioTheme = defineTheme({
  slots: ["root", "content"],
  base: {
    root: "relative w-full overflow-hidden",
    content: "absolute inset-0 h-full w-full object-cover"
  }
})

export default aspectRatioTheme
