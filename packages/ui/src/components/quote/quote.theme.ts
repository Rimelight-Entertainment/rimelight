import { defineTheme } from "../../resolver"

export const quoteTheme = defineTheme("quote", {
  slots: ["root", "icon", "quote", "caption"],
  base: {
    root: "relative my-8 border-y-2 border-default py-4",
    icon: "mb-2 s-10 md:absolute md:right-[calc(100%+1rem)] md:top-6 text-muted",
    quote:
      "font-heading heading-3 text-xl font-medium text-highlighted md:text-[32px] md:leading-[40px]",
    caption: "font-mono mt-4 text-right text-muted"
  },
  variants: {},
  defaultVariants: {}
})
