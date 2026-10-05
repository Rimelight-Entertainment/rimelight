import { defineTheme } from "../../resolver";

export const RLSurroundTheme = defineTheme("surround", {
  slots: ["root", "link", "label", "labelPrev", "labelNext", "title"],
  base: {
    root: "mt-12 pt-6 border-t border-default flex justify-between gap-4",
    link: "flex flex-col gap-1 group no-underline max-w-[45%]",
    label:
      "text-xs text-muted font-medium flex items-center gap-1 group-hover:text-primary transition-colors",
    labelPrev: "flex items-center gap-1",
    labelNext: "flex items-center justify-end gap-1",
    title:
      "text-sm font-semibold text-highlighted group-hover:text-primary transition-colors truncate",
  },
  variants: {
    side: {
      prev: {
        link: "text-left",
      },
      next: {
        link: "text-right",
      },
    },
  },
  compoundVariants: [],
  defaultVariants: {},
});
