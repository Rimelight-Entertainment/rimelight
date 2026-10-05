import { defineTheme } from "../../resolver";

export const RLSplitterTheme = defineTheme("splitter", {
  slots: ["root", "panel", "handle"],
  base: {
    root: "flex w-full h-full",
    panel: "overflow-auto transition-all",
    handle:
      "flex items-center justify-center bg-muted hover:bg-primary/50 transition-colors cursor-col-resize select-none border-x border-default/40",
  },
  variants: {
    direction: {
      horizontal: { root: "flex-row", handle: "w-1.5 h-full cursor-col-resize" },
      vertical: { root: "flex-col", handle: "h-1.5 w-full cursor-row-resize" },
    },
  },
  defaultVariants: {
    direction: "horizontal",
  },
});
