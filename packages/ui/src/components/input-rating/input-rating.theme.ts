import { colorConfig } from "../../config/color.config"
import { defineTheme } from "../../themes"

export const createInputRatingTheme = <
  const C extends readonly string[] = typeof colorConfig.colors
>(
  colors: C = colorConfig.colors as unknown as C
) =>
  defineTheme({
    slots: ["root", "item", "indicator", "icon", "emptyIcon"],
    base: {
      root: "inline-flex select-none",
      item: [
        "relative inline-block cursor-pointer select-none rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "transition-all duration-150"
      ],
      indicator:
        "absolute inset-y-0 left-0 overflow-hidden outline-none pointer-events-none flex items-center justify-start",
      icon: "block w-[var(--item-size)] h-[var(--item-size)] max-w-none shrink-0",
      emptyIcon:
        "absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-start text-muted"
    },
    variants: {
      orientation: {
        horizontal: {
          root: "flex-row items-center gap-0.5"
        },
        vertical: {
          root: "flex-col items-center gap-0.5"
        }
      },
      size: {
        xs: { item: "size-3" },
        sm: { item: "size-4" },
        md: { item: "size-5" },
        lg: { item: "size-6" },
        xl: { item: "size-7" }
      },
      color: Object.fromEntries(
        [...colors, "neutral"].map((color) => [
          color,
          color === "neutral"
            ? {
                indicator: "text-highlighted",
                item: "focus-visible:outline-inverted"
              }
            : {
                root: "rl-color-" + color,
                indicator: "text-[var(--rl-bg)]",
                item: "focus-visible:outline-[var(--rl-ring)]"
              }
        ])
      ) as Record<C[number] | "neutral", { root?: string; indicator: string; item: string }>,
      readonly: {
        true: {
          root: "cursor-default",
          item: "cursor-default pointer-events-none"
        },
        false: {}
      },
      disabled: {
        true: {
          root: "opacity-75 cursor-not-allowed",
          item: "cursor-not-allowed pointer-events-none"
        },
        false: {}
      }
    },
    defaultVariants: {
      color: "primary",
      size: "md",
      orientation: "horizontal",
      readonly: false,
      disabled: false
    },
    compoundVariants: [
      {
        readonly: false,
        disabled: false,
        classNames: {
          item: "hover:scale-110"
        }
      }
    ]
  })

export default createInputRatingTheme()
