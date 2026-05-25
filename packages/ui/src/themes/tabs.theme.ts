import { defineTheme } from "../utils/defineTheme"

export const createTabsTheme = () =>
  defineTheme({
    slots: ["root", "list", "trigger", "content"],
    base: {
      root: "w-full flex flex-col gap-4",
      list: "inline-flex items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
      trigger:
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-foreground cursor-pointer",
      content:
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    },
    variants: {
      variant: {
        solid: {
          list: "bg-muted p-1 rounded-lg",
          trigger:
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        },
        underline: {
          list: "bg-transparent border-b border-border rounded-none p-0 gap-4",
          trigger:
            "rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:text-foreground hover:border-muted-foreground/30"
        },
        pills: {
          list: "bg-transparent p-0 gap-2",
          trigger:
            "rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white"
        }
      },
      orientation: {
        horizontal: { root: "flex-col", list: "w-full" },
        vertical: {
          root: "flex-row gap-6",
          list: "flex-col items-stretch h-full w-48 border-r border-border rounded-none bg-transparent"
        }
      },
      size: {
        sm: { trigger: "text-xs px-2.5 py-1" },
        md: { trigger: "text-sm px-3.5 py-1.5" },
        lg: { trigger: "text-base px-4.5 py-2" }
      }
    },
    defaultVariants: {
      variant: "solid",
      orientation: "horizontal",
      size: "md"
    }
  })

export default createTabsTheme()
