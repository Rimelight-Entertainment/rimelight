import { defineTheme } from "../../resolver";

export const RLKeyboardTheme = defineTheme("keyboard", {
  slots: ["root", "container", "svg", "keyGroup", "keyLabel", "legend"],
  base: {
    root: "flex flex-col items-center p-4 rounded-xl w-full max-w-full my-4 box-border",
    container: "w-full flex justify-center",
    svg: "w-full h-auto max-w-[56.25rem]",
    keyGroup: "",
    keyLabel: "font-mono text-[10px] font-semibold pointer-events-none user-select-none",
    legend: "flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6 w-full",
  },
  variants: {},
  compoundVariants: [],
  defaultVariants: {},
});
