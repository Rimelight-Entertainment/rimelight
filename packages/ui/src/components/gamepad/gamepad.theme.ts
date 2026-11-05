import { defineTheme } from "../../resolver";

export const RLGamepadTheme = defineTheme("gamepad", {
  slots: [
    "root",
    "container",
    "svg",
    "button",
    "buttonActive",
    "shape",
    "label",
    "legend",
    "legendItem",
    "legendDot",
  ],
  base: {
    root: "flex flex-col items-center w-full max-w-full my-6 p-12 box-border rounded-[1.5rem] border border-default [container-type:inline-size]",
    container: "w-full max-w-[27.5rem]",
    svg: "w-full h-auto",
    button: "",
    buttonActive: "",
    shape: "transition-all duration-200",
    label: "text-[10px] font-sans font-extrabold leading-none pointer-events-none",
    legend: "flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10 w-full",
    legendItem:
      "flex items-center gap-2 m-0 p-0 h-[10px] text-[10px] text-muted uppercase tracking-[0.1em] font-bold leading-[10px]",
    legendDot: "flex-shrink-0 block",
  },
  variants: {},
  defaultVariants: {},
});
