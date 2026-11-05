import { defineTheme } from "../../resolver";

export const RLMarqueeTheme = defineTheme("marquee", {
  slots: ["root", "track"],
  base: {
    root: "group relative w-full overflow-hidden flex gap-[var(--marquee-gap,1rem)] mask-gradient-to-r",
    track:
      "flex shrink-0 gap-4 items-center animate-marquee [animation-duration:var(--rl-marquee-speed,40s)]",
  },
  variants: {
    direction: {
      left: { track: "flex-row animate-marquee-left" },
      right: { track: "flex-row animate-marquee-right" },
      up: { root: "flex-col h-80", track: "flex-col animate-marquee-up" },
      down: { root: "flex-col h-80", track: "flex-col animate-marquee-down" },
    },
    pauseOnHover: {
      true: { track: "group-hover:[animation-play-state:paused]" },
      false: { track: "" },
    },
  },
  defaultVariants: {
    direction: "left",
    pauseOnHover: true,
  },
});
