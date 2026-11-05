import { defineTheme } from "../../resolver";

export const RLSliderTheme = defineTheme("slider", {
  slots: ["root", "input", "track", "range", "thumb"],
  base: {
    root: "relative flex touch-none select-none items-center data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    input:
      "peer absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed",
    track: "relative overflow-hidden rounded-full bg-muted",
    range: "absolute bg-[var(--rl-bg)]",
    thumb:
      "pointer-events-none absolute block size-4.5 rounded-full border border-default bg-default shadow transition-all peer-hover:border-[var(--rl-border)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--rl-ring)]/50",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "h-5 w-full",
        track: "h-1.5 w-full",
        range: "left-0 top-0 h-full w-[var(--rl-slider-percent)]",
        thumb: "left-[var(--rl-slider-percent)] top-1/2 -translate-x-1/2 -translate-y-1/2",
      },
      vertical: {
        root: "h-full w-5 flex-col",
        input: "[writing-mode:vertical-lr] [direction:rtl]",
        track: "h-full w-1.5",
        range: "bottom-0 left-0 w-full h-[var(--rl-slider-percent)]",
        thumb: "bottom-[var(--rl-slider-percent)] left-1/2 translate-y-1/2 -translate-x-1/2",
      },
    },
    color: "auto",
  },
  defaultVariants: {
    orientation: "horizontal",
    color: "primary",
  },
});
