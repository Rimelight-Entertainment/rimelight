import { defineTheme } from "../../resolver";

export const RLColorSliderTheme = defineTheme("color-slider", {
  slots: ["root", "track", "thumb"],
  base: {
    root: "relative flex w-full touch-none select-none items-center outline-none",
    track:
      "relative h-3 w-full grow rounded-full border border-default bg-muted cursor-pointer outline-none [background:var(--rl-slider-track)]",
    thumb:
      "absolute block size-5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 left-[var(--rl-thumb-x,50%)] top-[var(--rl-thumb-y,50%)] [background-color:var(--rl-thumb-bg)] cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]/50",
  },
  variants: {
    color: "auto",
    disabled: {
      true: { root: "opacity-50 pointer-events-none" },
    },
  },
  defaultVariants: {
    color: "primary",
    disabled: false,
  },
});
