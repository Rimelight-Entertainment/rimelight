import { defineTheme } from "../../utils/resolver"

export const avatarGroupTheme = defineTheme({
  slots: ["root", "more"],
  base: {
    root: "flex -space-x-3 hover:space-x-0 transition-all duration-300 [&_[data-slot=root]]:ring-2 [&_[data-slot=root]]:ring-background [&_[data-slot=root]]:transition-all",
    more: [
      "inline-flex items-center justify-center rounded-full shrink-0 select-none cursor-default",
      "bg-elevated text-muted-foreground font-bold ring-2 ring-background",
      "transition-all duration-300"
    ]
  }
})
