import { defineTheme } from "../../resolver";

export const RLTreeTheme = defineTheme("tree", {
  slots: ["root", "item", "row", "toggle", "label", "icon", "text", "children"],
  base: {
    root: "flex flex-col gap-0.5 text-sm",
    item: "flex flex-col",
    row: "group flex items-center gap-1 rounded-md pl-[var(--rl-tree-indent,4px)] pr-2 py-1 text-highlighted hover:bg-elevated aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:opacity-50",
    toggle:
      "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-muted hover:text-highlighted disabled:cursor-default disabled:opacity-0",
    label: "flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left",
    icon: "shrink-0 text-muted group-aria-selected:text-primary",
    text: "min-w-0 truncate",
    children: "flex flex-col gap-0.5",
  },
});
