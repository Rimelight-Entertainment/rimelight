import { defineTheme } from "../../resolver";

export const linkGroupTheme = defineTheme("link-group", {
  slots: ["root", "title", "list", "item", "link"],
  base: {
    root: "flex flex-col gap-4",
    title: "font-bold text-sm uppercase tracking-wider text-dimmed",
    list: "flex flex-col gap-2",
    item: "",
    link: "text-sm text-muted hover:text-highlighted transition-colors"
  },
  variants: {},
  defaultVariants: {}
});
