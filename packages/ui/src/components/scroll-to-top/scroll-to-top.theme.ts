import { defineTheme } from "../../resolver";

export const RLScrollToTopTheme = defineTheme("scroll-to-top", {
  slots: ["root", "button", "progressBase", "track", "progress", "iconContainer", "icon"],
  base: {
    root: "fixed bottom-6 right-6 z-50 transition-opacity duration-300 opacity-0 pointer-events-none data-[state=visible]:opacity-100 data-[state=visible]:pointer-events-auto",
    button: "size-14 lg:size-12 rounded-full bg-scrim/85",
    progressBase: "relative size-full",
    track:
      "absolute inset-0 rounded-full border-solid border-[length:var(--rl-stt-border)] border-[color:var(--rl-stt-track)] bg-scrim",
    progress:
      "absolute inset-0 rounded-full bg-[image:var(--rl-stt-gauge)] [-webkit-mask:var(--rl-stt-mask)] [mask:var(--rl-stt-mask)]",
    iconContainer: "absolute inset-0 flex items-center justify-center text-center",
    icon: "size-6 text-on-scrim",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
