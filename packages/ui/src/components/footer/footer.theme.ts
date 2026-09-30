import { defineTheme } from "../../resolver";

export const footerTheme = defineTheme("footer", {
  slots: ["root", "container", "left", "center", "right"],
  base: {
    root: "py-8 lg:py-12 overflow-hidden text-default",
    container:
      "box-border flex flex-col justify-between gap-xl lg:flex-row lg:items-stretch px-xs sm:px-md md:px-xl lg:px-xl w-full",
    left: "order-last flex flex-col items-center justify-between gap-xl lg:order-1 lg:flex-none lg:items-start",
    center: "flex flex-col items-center justify-start lg:order-2 lg:flex-1",
    right:
      "order-first flex flex-col items-center justify-between gap-xl lg:order-3 lg:flex-none lg:items-end",
  },
  variants: {
    contain: {
      true: {
        container: "mx-auto max-w-(--rl-container)",
      },
      false: {
        container: "w-full",
      },
    },
  },
  defaultVariants: {
    contain: false,
  },
});
