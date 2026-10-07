import { defineTheme } from "../../resolver";

export const RLCardTheme = defineTheme("card", {
  slots: ["root", "header", "title", "description", "body", "footer", "overlay", "media"],
  base: {
    root: "block rounded-lg overflow-hidden",
    header: "p-4 sm:px-6",
    title: "text-highlighted font-semibold",
    description: "mt-1 text-muted text-sm",
    body: "p-4 sm:p-6",
    footer: "p-4 sm:px-6",
    overlay:
      "absolute inset-0 z-10 flex flex-col justify-end p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent text-white",
    media: "relative overflow-hidden",
  },
  variants: {
    variant: {
      solid: {
        root: "bg-inverted text-inverted",
        title: "text-inverted",
        description: "text-dimmed",
      },
      outline: {
        root: "bg-default ring ring-default divide-y divide-default",
      },
      soft: {
        root: "bg-elevated/50 divide-y divide-default",
      },
      subtle: {
        root: "bg-elevated/50 ring ring-default divide-y divide-default",
      },
    },
    overlay: {
      true: { root: "relative" },
      false: {},
    },
  },
  defaultVariants: {
    variant: "outline",
    overlay: false,
  },
});
