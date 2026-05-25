import { defineTheme } from "../utils/defineTheme"

export const createNavigationMenuTheme = () =>
  defineTheme({
    slots: ["root", "list", "item", "link", "trigger", "content", "viewport"],
    base: {
      root: "relative z-10 flex max-w-max flex-1 items-center justify-center",
      list: "group flex flex-1 list-none items-center justify-center gap-1",
      item: "relative",
      link: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-accent-foreground focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
      trigger:
        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 gap-1",
      content:
        "absolute left-0 top-full z-50 mt-1.5 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md origin-top-left",
      viewport: "absolute left-0 top-full flex justify-center w-full"
    },
    variants: {
      theme: {
        flat: { link: "rl-flat", trigger: "rl-flat" },
        light: { link: "rl-light", trigger: "rl-light" },
        dark: { link: "rl-dark", trigger: "rl-dark" }
      }
    },
    defaultVariants: {}
  })

export default createNavigationMenuTheme()
