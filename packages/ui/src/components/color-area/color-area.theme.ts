import { defineTheme } from "../../resolver";

export const RLColorAreaTheme = defineTheme("color-area", {
  slots: ["root", "area", "thumb"],
  base: {
    root: "relative block touch-none select-none rounded-lg w-full aspect-square outline-none",
    area: "relative w-full h-full rounded-lg cursor-crosshair bg-muted outline-none [background:var(--rl-area-bg)] [background-repeat:no-repeat] [background-size:100%_100%]",
    thumb:
      "absolute block size-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 left-[var(--rl-thumb-x,0%)] top-[var(--rl-thumb-y,0%)] [background-color:var(--rl-thumb-bg)] cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]/50",
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
