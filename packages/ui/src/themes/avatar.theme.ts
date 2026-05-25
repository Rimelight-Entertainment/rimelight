import { defaultColors } from "../presets/defaults"
import { defineTheme } from "../utils/defineTheme"

export const createAvatarTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "image", "fallback", "icon", "badge"],
    base: {
      root: "inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle relative",
      image: "h-full w-full rounded-[inherit] object-cover",
      fallback: "font-medium truncate",
      icon: "shrink-0",
      badge: "absolute rounded-full ring-2 ring-bg"
    },
    variants: {
      color: {
        ...Object.fromEntries(
          colors.map((color) => [
            color,
            {
              root: `bg-${color}/10`,
              fallback: `text-${color}`,
              icon: `text-${color}`
            }
          ])
        ),
        neutral: {
          root: "bg-elevated",
          fallback: "text-muted",
          icon: "text-muted"
        }
      },
      size: {
        "3xs": {
          root: "size-4 text-[8px]",
          badge: "size-1.5"
        },
        "2xs": {
          root: "size-5 text-[10px]",
          badge: "size-2"
        },
        "xs": {
          root: "size-6 text-xs",
          badge: "size-2"
        },
        "sm": {
          root: "size-7 text-sm",
          badge: "size-2.5"
        },
        "md": {
          root: "size-8 text-base",
          badge: "size-3"
        },
        "lg": {
          root: "size-9 text-lg",
          badge: "size-3"
        },
        "xl": {
          root: "size-10 text-xl",
          badge: "size-3.5"
        },
        "2xl": {
          root: "size-11 text-[22px]",
          badge: "size-4"
        },
        "3xl": {
          root: "size-12 text-2xl",
          badge: "size-4"
        }
      },
      badgePosition: {
        "top-right": { badge: "top-0 right-0" },
        "bottom-right": { badge: "bottom-0 right-0" },
        "top-left": { badge: "top-0 left-0" },
        "bottom-left": { badge: "bottom-0 left-0" }
      }
    },
    defaultVariants: {
      size: "md",
      color: "neutral",
      badgePosition: "bottom-right"
    }
  })

export default createAvatarTheme()
