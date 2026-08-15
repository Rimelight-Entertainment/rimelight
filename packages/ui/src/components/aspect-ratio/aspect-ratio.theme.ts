import { defineTheme } from "../../utils/resolver"

export const aspectRatioTheme = defineTheme({
  slots: ["root", "content"],
  base: {
    root: "relative w-full overflow-hidden",
    content: "absolute inset-0 h-full w-full object-cover"
  }
})
