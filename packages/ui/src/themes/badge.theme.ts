import { defaultColors } from "../presets/defaults"
import { defineTheme } from "../utils/defineTheme"

export const createBadgeTheme = (colors: readonly string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "label", "leadingIcon", "leadingAvatar", "leadingAvatarSize", "trailingIcon"],
    base: {
      root: "font-medium inline-flex items-center gap-1.5 transition-all duration-150 select-none",
      label: "truncate",
      leadingIcon: "shrink-0",
      leadingAvatar: "shrink-0",
      leadingAvatarSize: "",
      trailingIcon: "shrink-0"
    },
    variants: {
      variant: {
        solid: { root: "" },
        outline: { root: "" },
        soft: { root: "" },
        subtle: { root: "" }
      },
      color: {
        ...Object.fromEntries(colors.map((color) => [color, { root: "" }])),
        neutral: { root: "" }
      },
      size: {
        xs: {
          root: "text-[8px]/3 px-1 py-0.5 gap-1 rounded-sm",
          leadingIcon: "size-3",
          leadingAvatarSize: "3xs",
          trailingIcon: "size-3"
        },
        sm: {
          root: "text-[10px]/3 px-1.5 py-1 gap-1 rounded-sm",
          leadingIcon: "size-3",
          leadingAvatarSize: "3xs",
          trailingIcon: "size-3"
        },
        md: {
          root: "text-xs px-2 py-1 gap-1 rounded-md",
          leadingIcon: "size-4",
          leadingAvatarSize: "3xs",
          trailingIcon: "size-4"
        },
        lg: {
          root: "text-sm px-2 py-1 gap-1.5 rounded-md",
          leadingIcon: "size-5",
          leadingAvatarSize: "2xs",
          trailingIcon: "size-5"
        },
        xl: {
          root: "text-base px-2.5 py-1 gap-1.5 rounded-md",
          leadingIcon: "size-6",
          leadingAvatarSize: "2xs",
          trailingIcon: "size-6"
        }
      },
      shape: {
        square: { root: "rounded-sm" },
        rounded: { root: "rounded-md" },
        pill: { root: "rounded-full" }
      },
      square: {
        true: { root: "" }
      },
      theme: {
        light: { root: "rl-light" },
        dark: { root: "rl-dark" }
      }
    },
    compoundVariants: [
      ...colors.map((color) => ({
        variant: "solid" as const,
        color,
        classNames: {
          root: "rl-color-" + color + " bg-[var(--rl-bg)] text-white"
        }
      })),
      ...colors.map((color) => ({
        variant: "outline" as const,
        color,
        classNames: {
          root:
            "rl-color-" +
            color +
            " text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/50"
        }
      })),
      ...colors.map((color) => ({
        variant: "soft" as const,
        color,
        classNames: {
          root: "rl-color-" + color + " bg-[var(--rl-bg)]/10 text-[var(--rl-text)]"
        }
      })),
      ...colors.map((color) => ({
        variant: "subtle" as const,
        color,
        classNames: {
          root:
            "rl-color-" +
            color +
            " bg-[var(--rl-bg)]/10 text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25"
        }
      })),
      {
        color: "neutral",
        variant: "solid",
        classNames: {
          root: "text-inverted bg-inverted"
        }
      },
      {
        color: "neutral",
        variant: "outline",
        classNames: {
          root: "ring ring-inset ring-accented text-default bg-default"
        }
      },
      {
        color: "neutral",
        variant: "soft",
        classNames: {
          root: "text-default bg-elevated"
        }
      },
      {
        color: "neutral",
        variant: "subtle",
        classNames: {
          root: "ring ring-inset ring-accented text-default bg-elevated"
        }
      },
      {
        size: "xs",
        square: true,
        classNames: { root: "p-0.5" }
      },
      {
        size: "sm",
        square: true,
        classNames: { root: "p-1" }
      },
      {
        size: "md",
        square: true,
        classNames: { root: "p-1" }
      },
      {
        size: "lg",
        square: true,
        classNames: { root: "p-1" }
      },
      {
        size: "xl",
        square: true,
        classNames: { root: "p-1" }
      }
    ],
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "md",
      shape: "pill"
    }
  })

export default createBadgeTheme()
