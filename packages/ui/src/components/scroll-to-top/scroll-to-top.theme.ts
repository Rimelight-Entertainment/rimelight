import { defineTheme } from "../../resolver";

export const RLScrollToTopTheme = defineTheme("scroll-to-top", {
  slots: ["root", "button", "progressBase", "svg", "iconContainer", "icon"],
  base: {
    root: "fixed bottom-6 right-6 z-50",
    button: "size-14 lg:size-12 p-0 rounded-full bg-black/85",
    progressBase: "progress-circle-base size-full",
    svg: "size-full",
    iconContainer: "absolute inset-0 flex items-center justify-center text-center",
    icon: "size-6 text-white",
  },
  variants: {
    color: "auto",
  },
  compoundVariants: [
    {
      color: "primary",
      class: {
        icon: "text-neutral-50",
      },
    },
    {
      color: "secondary",
      class: {
        icon: "text-neutral-50",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
  },
});
