import { defineTheme } from "../../resolver";

export const RLScrollToTopTheme = defineTheme("scroll-to-top", {
  slots: ["root", "button", "progressBase", "track", "progress", "svg", "iconContainer", "icon"],
  base: {
    root: "fixed bottom-6 right-6 z-50",
    button: "size-14 lg:size-12 p-0 rounded-full bg-black/85",
    progressBase: "progress-circle-base size-full",
    track:
      "absolute inset-0 rounded-full border-solid border-[length:var(--rl-stt-border)] border-[color:var(--rl-stt-track)] bg-black",
    progress:
      "absolute inset-0 rounded-full bg-[image:var(--rl-stt-gauge)] [-webkit-mask:var(--rl-stt-mask)] [mask:var(--rl-stt-mask)]",
    svg: "size-full",
    iconContainer: "absolute inset-0 flex items-center justify-center text-center",
    icon: "size-6 text-white",
  },
});
