import { defineTheme } from "../utils/defineTheme"

export const avatarTheme = defineTheme({
  slots: ["root", "image", "fallback", "badge"],
  base: {
    root: "relative flex shrink-0 overflow-hidden rounded-full select-none",
    image: "aspect-square h-full w-full object-cover",
    fallback: "flex h-full w-full items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground uppercase",
    badge: "absolute bottom-0 right-0 block size-2.5 rounded-full ring-2 ring-background"
  },
  variants: {
    size: {
      sm: { root: "size-8", fallback: "text-xs" },
      md: { root: "size-10", fallback: "text-sm" },
      lg: { root: "size-12", fallback: "text-base" }
    },
    hasBadge: {
      true: { badge: "block" },
      false: { badge: "hidden" }
    }
  },
  defaultVariants: {
    size: "md",
    hasBadge: false
  }
})

export default avatarTheme
