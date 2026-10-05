import { defineTheme } from "../../resolver";

export const RLLocaleSelectorTheme = defineTheme("locale-selector", {
  slots: ["root", "wrapper", "select"],
  base: {
    root: "inline-flex flex-col gap-1.5",
    wrapper: "relative inline-block",
    select: "",
  },
});
