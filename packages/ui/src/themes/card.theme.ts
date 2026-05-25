import { defineTheme } from "../utils/defineTheme"

export const createCardTheme = () =>
  defineTheme({
    slots: ["root", "header", "title", "description", "body", "footer"],
    base: {
      root: "rounded-lg overflow-hidden transition-all duration-300",
      header: "p-4 sm:px-6",
      title: "text-highlighted font-semibold",
      description: "mt-1 text-muted text-sm",
      body: "p-4 sm:p-6",
      footer: "p-4 sm:px-6"
    },
    variants: {
      variant: {
        solid: {
          root: "bg-inverted text-inverted",
          title: "text-inverted",
          description: "text-dimmed"
        },
        outline: {
          root: "bg-default ring ring-default divide-y divide-default"
        },
        soft: {
          root: "bg-elevated/50 divide-y divide-default"
        },
        subtle: {
          root: "bg-elevated/50 ring ring-default divide-y divide-default"
        }
      },
      interactive: {
        true: { root: "hover:shadow-md cursor-pointer" },
        false: { root: "" }
      }
    },
    defaultVariants: {
      variant: "outline",
      interactive: false
    }
  })

export default createCardTheme()
