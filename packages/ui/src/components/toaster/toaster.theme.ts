import { defineTheme } from "../../resolver";

export const RLToasterTheme = defineTheme("toaster", {
  slots: ["root"],
  base: {
    root: "fixed bottom-5 right-5 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none",
  },
  variants: {},
  compoundVariants: [],
  defaultVariants: {},
});
