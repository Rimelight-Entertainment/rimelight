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
      "3xs": { base: "size-1.5" },
      "2xs": { base: "size-2" },
      xs: { base: "size-2" },
      sm: { base: "size-2.5" },
      md: { base: "size-3" },
      lg: { base: "size-3" },
      xl: { base: "size-3.5" },
      "2xl": { base: "size-4" },
      "3xl": { base: "size-4" },
    },
    position: {
      "top-right": { base: "top-0 right-0" },
      "bottom-right": { base: "bottom-0 right-0" },
      "top-left": { base: "top-0 left-0" },
      "bottom-left": { base: "bottom-0 left-0" },
    },
    inset: {
      false: { base: "" },
    },
    standalone: {
      false: { base: "absolute" },
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      classNames: { base: "bg-inverted text-default" },
    },
    {
      position: "top-right",
      inset: false,
      classNames: { base: "-translate-y-1/2 translate-x-1/2 transform" },
    },
    {
      position: "bottom-right",
      inset: false,
      classNames: { base: "translate-y-1/2 translate-x-1/2 transform" },
    },
    {
      position: "top-left",
      inset: false,
      classNames: { base: "-translate-y-1/2 -translate-x-1/2 transform" },
    },
    {
      position: "bottom-left",
      inset: false,
      classNames: { base: "translate-y-1/2 -translate-x-1/2 transform" },
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
    position: "top-right",
    inset: false,
  },
});
