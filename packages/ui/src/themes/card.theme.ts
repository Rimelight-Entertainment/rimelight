import { defineTheme } from "./defineTheme"

export const createCardTheme = () =>
  defineTheme({
    slots: ["root", "header", "title", "description", "body", "footer", "overlay", "media"],
    base: {
      root: "rounded-lg overflow-hidden",
      header: "p-4 sm:px-6 border-default",
      title: "text-highlighted font-semibold",
      description: "mt-1 text-muted-foreground text-sm",
      body: "p-4 sm:p-6 border-default",
      footer: "p-4 sm:px-6 border-default",
      overlay:
        "absolute inset-0 z-10 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent text-white",
      media: "relative border-default"
    },
    variants: {
      variant: {
        solid: {
          root: "bg-inverted text-inverted",
          title: "text-inverted",
          description: "text-dimmed"
        },
        outline: {
          root: "bg-default border border-default divide-y divide-default"
        },
        soft: {
          root: "bg-elevated/50 divide-y divide-default"
        },
        subtle: {
          root: "bg-elevated/50 border border-default divide-y divide-default"
        }
      },
      interactive: {
        true: { root: "hover:shadow-md cursor-pointer" },
        false: { root: "" }
      },
      overlay: {
        true: { root: "relative" },
        false: {}
      }
    },
    defaultVariants: {
      variant: "outline",
      interactive: false,
      overlay: false
    }
  })

export default createCardTheme()
