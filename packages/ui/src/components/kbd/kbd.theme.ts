import { colorNames } from "../../config"
import { defineTheme } from "../../types/component"

export const createKbdTheme = (colors: readonly string[] = colorNames) => {
  const colorVariants: Record<string, { root: string }> = { neutral: { root: "" } }
  for (const c of colors) {
    colorVariants[c] = { root: "" }
  }

  return defineTheme({
    slots: ["root"],
    base: {
      root: "inline-flex items-center justify-center px-1 rounded-sm font-medium font-sans uppercase"
    },
    variants: {
      color: colorVariants,
      variant: {
        solid: { root: "" },
        outline: { root: "" },
        soft: { root: "" },
        subtle: { root: "" }
      },
      size: {
        sm: { root: "h-4 min-w-[16px] text-[10px]" },
        md: { root: "h-5 min-w-[20px] text-[11px]" },
        lg: { root: "h-6 min-w-[24px] text-[12px]" }
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
            " ring ring-inset ring-[var(--rl-border)]/50 text-[var(--rl-text)]"
        }
      })),
      ...colors.map((color) => ({
        variant: "soft" as const,
        color,
        classNames: {
          root: "rl-color-" + color + " text-[var(--rl-text)] bg-[var(--rl-bg)]/10"
        }
      })),
      ...colors.map((color) => ({
        variant: "subtle" as const,
        color,
        classNames: {
          root:
            "rl-color-" +
            color +
            " text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25 bg-[var(--rl-bg)]/10"
        }
      })),
      {
        color: "neutral",
        variant: "solid",
        classNames: { root: "text-inverted bg-inverted" }
      },
      {
        color: "neutral",
        variant: "outline",
        classNames: { root: "ring ring-inset ring-accented text-default bg-default" }
      },
      {
        color: "neutral",
        variant: "soft",
        classNames: { root: "text-default bg-elevated" }
      },
      {
        color: "neutral",
        variant: "subtle",
        classNames: { root: "ring ring-inset ring-accented text-default bg-elevated" }
      }
    ],
    defaultVariants: {
      variant: "outline",
      color: "neutral",
      size: "md"
    }
  })
}

export default createKbdTheme()
