import { defineTheme } from "../../resolver";

export const skeletonTheme = defineTheme("skeleton", {
  slots: ["root"],
  base: {
    root: "animate-pulse bg-elevated shrink-0"
  },
  variants: {
    shape: {
      circle: { root: "rounded-full" },
      rectangle: { root: "rounded-none" },
      rounded: { root: "rounded-md" }
    }
  },
  defaultVariants: {
    shape: "rounded"
  }
});
