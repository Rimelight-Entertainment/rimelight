import { defineTheme } from "../../resolver";

export const RLGamepadTheme = defineTheme("gamepad", {
  slots: [
    "root",
    "container",
    "svg",
    "gradientTop",
    "gradientBottom",
    "body",
    "panel",
    "button",
    "buttonActive",
    "shape",
    "label",
    "labelActive",
    "legend",
    "legendItem",
    "legendDot",
    "legendLabel",
  ],
  base: {
    root: "flex flex-col items-center w-full max-w-full my-6 p-12 box-border rounded-[1.5rem] border border-default [container-type:inline-size]",
    container: "w-full max-w-[27.5rem]",
    svg: "w-full h-auto",
    gradientTop: "text-elevated",
    gradientBottom: "text-default",
    body: "stroke-default",
    panel: "text-default stroke-default",
    button: "text-elevated stroke-default stroke-1",
    buttonActive: "text-primary stroke-on-scrim/20 stroke-[1.5]",
    shape: "transition-all duration-200",
    label: "text-[10px] font-sans font-extrabold leading-none pointer-events-none text-muted",
    labelActive:
      "text-[10px] font-sans font-extrabold leading-none pointer-events-none text-on-scrim",
    legend: "flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10 w-full",
    legendItem:
      "flex items-center gap-2 m-0 p-0 h-[10px] text-[10px] text-muted uppercase tracking-[0.1em] font-bold leading-[10px]",
    legendDot: "flex-shrink-0 block",
    legendLabel: "inline-block h-[10px] leading-[10px] m-0 p-0",
  },
  variants: {},
});
