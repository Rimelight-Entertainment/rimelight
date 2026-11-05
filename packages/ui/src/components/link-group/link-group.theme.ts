import { defineTheme } from "../../resolver";

export const RLLinkGroupTheme = defineTheme("link-group", {
  slots: ["root", "title", "heading", "titleLink", "list", "item", "link"],
  base: {
    root: "flex flex-col gap-4",
    title: "font-bold text-sm uppercase tracking-wider text-dimmed",
    heading: "flex items-center gap-1.5",
    titleLink: "hover:underline flex items-center gap-1.5",
    list: "flex flex-col gap-2",
    link: "w-full justify-start text-sm text-muted hover:text-highlighted transition-colors",
  },
  variants: {},
});
