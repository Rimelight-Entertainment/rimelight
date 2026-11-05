import { defineTheme } from "../../resolver";

export const RLMarqueeTheme = defineTheme("marquee", {
  slots: ["root", "track"],
  base: {
    root: "group relative w-full overflow-hidden flex gap-[var(--marquee-gap,1rem)] mask-gradient-to-r",
    track:
      "flex shrink-0 gap-4 items-center animate-marquee [animation-duration:var(--rl-marquee-speed,40s)]",
  },
  variants: {
    orientation: {
      horizontal: { root: "flex-row", track: "flex-row" },
      vertical: { root: "flex-col h-80", track: "flex-col" },
    },
    pauseOnHover: {
      true: { track: "group-hover:[animation-play-state:paused]" },
    },
  },
  compoundVariants: [
    { orientation: "horizontal", reverse: false, class: { track: "animate-marquee-left" } },
    { orientation: "horizontal", reverse: true, class: { track: "animate-marquee-right" } },
    { orientation: "vertical", reverse: false, class: { track: "animate-marquee-up" } },
    { orientation: "vertical", reverse: true, class: { track: "animate-marquee-down" } },
  ],
  defaultVariants: {
    orientation: "horizontal",
    reverse: false,
    pauseOnHover: true,
  },
});
