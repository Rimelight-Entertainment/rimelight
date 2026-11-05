import { defineTheme } from "../../resolver";

export const RLPlaceholderTheme = defineTheme("placeholder", {
  slots: ["root", "svg"],
  base: {
    root: "relative flex items-center justify-center overflow-hidden rounded-sm border-1 border-dashed border-primary px-4 opacity-75",
    svg: "absolute inset-0 h-full w-full stroke-primary/10",
  },
  variants: {},
});
