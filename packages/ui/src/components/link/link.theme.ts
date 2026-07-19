import { defineTheme } from "../../utils/defineTheme"

export const createLinkTheme = () =>
  defineTheme({
    slots: ["root", "label", "leadingIcon", "trailingIcon"],
    base: {
      root: "outline-primary/25 focus-visible:outline-3 rounded-md inline-flex items-center gap-1 leading-none transition-colors",
      label: ""
    },
    variants: {
      active: {
        true: { root: "text-primary" },
        false: { root: "text-muted" }
      },
      disabled: {
        true: { root: "cursor-not-allowed opacity-75" },
        false: { root: "hover:text-primary" }
      },
      theme: {
        light: { root: "rl-light" },
        dark: { root: "rl-dark" }
      }
    },
    compoundVariants: [
      {
        active: false,
        disabled: false,
        classNames: { root: ["hover:text-default", "transition-colors"] }
      }
    ]
  })

export default createLinkTheme()
