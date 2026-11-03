import { defineTheme } from "../../resolver";

export const RLChipTheme = defineTheme("chip", {
  slots: ["root", "base"],
  base: {
    root: "relative inline-flex items-center justify-center shrink-0",
    base: "rounded-full ring-2 ring-bg flex items-center justify-center text-inverted font-medium whitespace-nowrap bg-[var(--rl-bg,var(--rl-primary))] text-[8px]",
  },
  variants: {
    color: "auto",
    size: {
      xs: { base: "h-1.5 min-w-1.5 text-[6px] p-0.5" },
      sm: { base: "h-[7px] min-w-[7px] text-[7px] p-0.5" },
      md: { base: "h-2 min-w-2 text-[8px] p-0.5" },
      lg: { base: "h-[9px] min-w-[9px] text-[9px] p-0.5" },
      xl: { base: "h-2.5 min-w-2.5 text-[10px] p-0.5" },
    },
    position: {
      "top-right": { base: "top-0 right-0" },
      "bottom-right": { base: "bottom-0 right-0" },
      "top-left": { base: "top-0 left-0" },
      "bottom-left": { base: "bottom-0 left-0" },
    },
    inset: {
      false: { base: "" },
      true: { base: "" },
    },
    standalone: {
      false: { base: "absolute" },
      true: { base: "" },
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      class: { base: "bg-inverted text-default" },
    },
    {
      position: "top-right",
      inset: false,
      class: { base: "-translate-y-1/2 translate-x-1/2 transform" },
    },
    {
      position: "bottom-right",
      inset: false,
      class: { base: "translate-y-1/2 translate-x-1/2 transform" },
    },
    {
      position: "top-left",
      inset: false,
      class: { base: "-translate-y-1/2 -translate-x-1/2 transform" },
    },
    {
      position: "bottom-left",
      inset: false,
      class: { base: "translate-y-1/2 -translate-x-1/2 transform" },
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
    position: "top-right",
    inset: false,
    standalone: false,
  },
});
