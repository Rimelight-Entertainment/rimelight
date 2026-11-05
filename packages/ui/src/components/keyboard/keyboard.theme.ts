import { defineTheme } from "../../resolver";

export const RLKeyboardTheme = defineTheme("keyboard", {
  slots: [
    "root",
    "container",
    "svg",
    "keyGroup",
    "keyShadow",
    "keyCapFill",
    "keyCapFillActive",
    "keyCapStroke",
    "keyCapStrokeActive",
    "keyLabelIdle",
    "keyLabelActive",
    "legend",
    "legendItem",
    "legendMarker",
    "legendSwatch",
    "legendLabel",
  ],
  base: {
    root: "flex flex-col items-center p-4 rounded-xl w-full max-w-full my-4 box-border",
    container: "w-full flex justify-center",
    svg: "w-full h-auto max-w-[56.25rem]",
    keyShadow: "fill-default",
    keyCapFill: "fill-elevated",
    keyCapFillActive: "fill-primary",
    keyCapStroke: "stroke-default",
    keyCapStrokeActive: "stroke-on-scrim/40",
    keyLabelIdle:
      "font-mono text-[10px] font-semibold pointer-events-none user-select-none fill-highlighted",
    keyLabelActive:
      "font-mono text-[10px] font-semibold pointer-events-none user-select-none fill-on-scrim",
    legend: "flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6 w-full",
    legendItem:
      "flex items-center gap-2 m-0 p-0 text-[10px] text-muted uppercase tracking-[0.05em] font-medium whitespace-nowrap leading-none",
    legendMarker: "shrink-0 block",
    legendSwatch: "fill-primary",
    legendLabel: "m-0 p-0 leading-none inline-block",
  },
  variants: {},
  compoundVariants: [],
});
