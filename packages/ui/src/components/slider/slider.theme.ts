import { defineTheme } from "../../resolver";

export const RLSliderTheme = defineTheme("slider", {
  slots: ["root", "input", "track", "range", "thumb"],
  base: {
    root: "relative flex w-full touch-none select-none items-center",
    input: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
    track: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted",
    range: "absolute h-full bg-[var(--rl-bg)]",
    thumb:
      "block size-4.5 rounded-full border border-default bg-default shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]/50 hover:border-[var(--rl-border)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
