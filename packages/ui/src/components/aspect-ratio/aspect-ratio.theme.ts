import { defineTheme } from "../../utils/resolver"

export const aspectRatioTheme = defineTheme("aspect-ratio", {
  slots: ["root", "content"],
  base: {
    root: "relative w-full overflow-hidden",
    content: "absolute inset-0 h-full w-full object-cover"
  }
})
