import { defineTheme } from "../../resolver"

export const scrollToTopTheme = defineTheme("scroll-to-top", {
  slots: ["root", "button", "progressBase", "svg", "iconContainer", "icon"],
  base: {
    root: "fixed bottom-6 right-6 z-50",
    button: "size-14 lg:size-12 p-0 rounded-full bg-black/85",
    progressBase: "progress-circle-base size-full",
    svg: "size-full",
    iconContainer: "absolute inset-0 flex items-center justify-center text-center",
    icon: "size-6 text-white"
  },
  variants: {
    color: "auto",
    theme: {
      light: { root: "rl-light" },
      dark: { root: "rl-dark" }
    }
  },
  compoundVariants: [
    {
      color: "primary",
      classNames: {
        icon: "text-primary-foreground"
      }
    },
    {
      color: "secondary",
      classNames: {
        icon: "text-secondary-foreground"
      }
    }
  ],
  defaultVariants: {
    color: "primary"
  }
})
