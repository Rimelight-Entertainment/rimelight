import { defineTheme } from "../../resolver"

export const localeSelectorTheme = defineTheme("locale-selector", {
  slots: ["root", "wrapper", "select"],
  base: {
    root: "inline-flex flex-col gap-1.5",
    wrapper: "relative inline-block",
    select: ""
  }
})

export default localeSelectorTheme
