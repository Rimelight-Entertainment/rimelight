import { colorNames, uiConfig } from "../../config"
import { defineTheme } from "../../utils/resolver"

const colors = uiConfig.colors ?? colorNames

export const inputTagsTheme = defineTheme("input-tags", {
  slots: ["root", "tag", "tagLabel", "more", "input"],
  base: {
    root: "flex flex-wrap items-center gap-1.5",
    tag: [
      "inline-flex items-center gap-1 px-2 py-0.5",
      "rounded-full text-xs font-medium",
      "bg-elevated text-foreground",
      "ring-1 ring-border/60",
      "whitespace-nowrap select-none"
    ],
    tagLabel: "leading-none",
    more: [
      "inline-flex items-center justify-center px-2 py-0.5",
      "rounded-full text-xs font-semibold",
      "bg-muted text-muted-foreground",
      "ring-1 ring-border/40",
      "whitespace-nowrap select-none cursor-default"
    ],
    input: [
      "flex-1 min-w-[6rem] bg-transparent text-sm outline-none",
      "placeholder:text-muted-foreground"
    ]
  },
  variants: {
    color: {
      ...Object.fromEntries(
        colors.map((color) => [
          color,
          {
            tag: `bg-${color}/10 text-${color}-700 ring-${color}/30`
          }
        ])
      ),
      neutral: {
        tag: "bg-elevated text-foreground ring-border/60"
      }
    }
  },
  defaultVariants: {
    color: "neutral"
  }
})
