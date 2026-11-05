import { defineTheme } from "../../resolver";

export const RLScrollToTopTheme = defineTheme("scroll-to-top", {
  slots: ["root", "button", "progressBase", "track", "progress", "iconContainer", "icon"],
  base: {
    root: "fixed bottom-6 right-6 z-50 invisible opacity-0 pointer-events-none transition-[opacity,visibility] duration-300 data-[state=visible]:visible data-[state=visible]:opacity-100 data-[state=visible]:pointer-events-auto",
    button: "size-14 lg:size-12 p-0 rounded-full bg-scrim/85 text-on-scrim",
    progressBase: "relative size-full",
    track:
      "absolute inset-0 rounded-full border-solid border-[length:var(--rl-stt-border)] border-[color:color-mix(in_oklab,var(--rl-border)_30%,transparent)] bg-scrim",
    progress:
      "absolute inset-0 rounded-full text-[var(--rl-border)] bg-[image:var(--rl-stt-gauge)] [-webkit-mask:radial-gradient(circle_closest-side,transparent_calc(100%_-_var(--rl-stt-border)),currentColor_calc(100%_-_var(--rl-stt-border)))] [mask:radial-gradient(circle_closest-side,transparent_calc(100%_-_var(--rl-stt-border)),currentColor_calc(100%_-_var(--rl-stt-border)))]",
    iconContainer: "absolute inset-0 flex items-center justify-center text-center",
    icon: "size-6",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
