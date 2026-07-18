import { defineTheme } from "../../types/theme"

export const createLinkGroupTheme = () =>
  defineTheme({
    slots: ["root", "title", "list", "item", "link"],
    base: {
      root: "flex flex-col gap-4",
      title: "font-bold text-sm uppercase tracking-wider text-neutral-500",
      list: "flex flex-col gap-2",
      item: "",
      link: "text-sm text-muted-foreground hover:text-accent-foreground transition-colors"
    },
    variants: {
      theme: {
        dark: {
          link: "text-white hover:text-accent-foreground",
          title: "text-white"
        },
        light: {
          link: "text-foreground hover:text-accent-foreground",
          title: "text-foreground"
        }
      }
    },
    defaultVariants: {}
  })

export default createLinkGroupTheme()
