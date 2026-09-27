import { defineTheme } from "../../resolver"

export const aspectRatioTheme = defineTheme("aspect-ratio", {
  slots: ["root", "spacer", "content"],
  base: {
    root: "relative w-full overflow-hidden",
    spacer: "block h-auto w-full pointer-events-none",
    content: "absolute inset-0 h-full w-full object-cover [&>*]:h-full [&>*]:w-full"
  }
})
