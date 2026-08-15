import { colorNames, uiConfig } from "../../config"
import { defineTheme } from "../../utils/resolver"

const colors = uiConfig.colors ?? colorNames

export const scrollToTopTheme = defineTheme({
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
    color: Object.fromEntries(
      colors.map((color) => [
        color,
        {
          root: "rl-color-" + color,
          progressBase: "",
          svg: "",
          iconContainer: "",
          icon: ""
        }
      ])
    ),
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
