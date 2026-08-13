import { colorConfig } from "../../config"
import { defineTheme } from "../../types/component"

export const createSwitchTheme = (colors: readonly string[] = colorConfig.colors) =>
  defineTheme({
    slots: ["root", "input", "track", "thumb", "label"],
    base: {
      root: "inline-flex items-center gap-2 cursor-pointer select-none",
      input: "absolute opacity-0 size-0 pointer-events-none peer",
      track: [
        "inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent bg-muted transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      ],
      thumb:
        "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 translate-x-0",
      label: "text-sm text-foreground leading-none"
    },
    variants: {
      color: Object.fromEntries(
        colors.map((color) => [
          color,
          {
            root: "rl-color-" + color,
            track: `peer-checked:bg-[var(--rl-bg)] focus-within:ring-[var(--rl-ring)]/50`
          }
        ])
      ),
      size: {
        sm: { track: "h-4 w-7", thumb: "size-3", label: "text-xs" },
        md: { track: "h-5 w-9", thumb: "size-4", label: "text-sm" },
        lg: { track: "h-6 w-11", thumb: "size-5", label: "text-base" }
      },
      checked: {
        true: { thumb: "translate-x-full" },
        false: { thumb: "translate-x-0" }
      },
      theme: {
        light: { root: "rl-light" },
        dark: { root: "rl-dark" }
      }
    },
    compoundVariants: [
      {
        size: "sm",
        checked: true,
        classNames: { thumb: "translate-x-3" }
      },
      {
        size: "md",
        checked: true,
        classNames: { thumb: "translate-x-4" }
      },
      {
        size: "lg",
        checked: true,
        classNames: { thumb: "translate-x-5" }
      }
    ],
    defaultVariants: {
      color: "primary",
      size: "md",
      checked: false
    }
  })

export default createSwitchTheme()
