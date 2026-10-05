import { defineTheme } from "../../resolver";

export const RLStickySurfaceTheme = defineTheme("sticky-surface", {
  slots: ["root"],
  base: {
    root: "sticky top-0 self-start transition-all duration-300",
  },
});
