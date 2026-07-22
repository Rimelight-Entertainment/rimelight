import { defineTheme } from "../../utils/defineTheme"

export const createNavigationMenuTheme = () =>
  defineTheme({
    slots: ["root", "list", "item", "link", "trigger", "content", "viewport", "viewportWrapper"],
    base: {
      root: "relative z-10 flex w-full",
      list: "group flex flex-1 list-none",
      item: "relative",
      link: "text-foreground inline-flex items-center px-4 py-2 text-sm font-medium transition-colors hover:text-accent-foreground focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
      trigger:
        "group inline-flex h-10 items-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 gap-1",
      content:
        "absolute left-0 top-full z-50 mt-1.5 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md origin-top-left",
      viewportWrapper: "absolute left-0 top-full flex justify-center w-full",
      viewport:
        "relative mt-1.5 h-auto w-full origin-top overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90"
    },
    variants: {
      theme: {
        light: { link: "rl-light", trigger: "rl-light" },
        dark: { link: "rl-dark", trigger: "rl-dark" }
      },
      orientation: {
        horizontal: {
          root: "max-w-max flex-1 items-center justify-center",
          list: "items-center justify-center space-x-1",
          link: "justify-center w-max",
          trigger: "w-max"
        },
        vertical: {
          root: "flex-col w-full items-stretch justify-start",
          list: "flex-col flex-1 items-stretch justify-start space-y-2 w-full",
          link: "justify-start w-full px-4 py-2 text-lg",
          trigger: "justify-start w-full h-10 px-4 py-2 text-lg"
        }
      }
    },
    defaultVariants: {
      orientation: "horizontal"
    }
  })

export default createNavigationMenuTheme()
