import { defaultColors } from "../presets/defaults"
import { defineTheme } from "../utils/defineTheme"

export const createCalloutTheme = (colors: readonly string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "body", "icon", "title", "content", "avatar", "avatarSize", "actions", "close"],
    base: {
      root: "relative overflow-hidden w-full rounded-lg p-4 flex gap-2.5 items-start",
      body: "flex flex-col gap-2.5 flex-1 min-w-0",
      icon: "shrink-0 size-6 inline-flex items-center justify-center",
      title: "text-sm font-bold",
      content: "text-sm opacity-90 leading-relaxed [&>:first-child]:mt-0 [&>:last-child]:mb-0",
      avatar: "shrink-0",
      avatarSize: "2xl",
      actions: "flex flex-wrap gap-1.5",
      close: "p-0 ml-auto"
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
      } as Record<string, { root: string }>,
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
            " text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25"
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
          root: "text-highlighted bg-default ring ring-inset ring-default"
        }
      },
      {
        color: "neutral",
        variant: "soft",
        classNames: {
          root: "text-highlighted bg-elevated/50"
        }
      },
      {
        color: "neutral",
        variant: "subtle",
        classNames: {
          root: "text-highlighted bg-elevated/50 ring ring-inset ring-accented"
        }
      }
    ],
    defaultVariants: {
      color: "primary",
      variant: "solid"
    }
  })

export default createCalloutTheme()
