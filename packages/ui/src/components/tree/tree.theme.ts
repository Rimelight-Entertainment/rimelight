import { defineTheme } from "../../resolver";

export const RLTreeTheme = defineTheme("tree", {
  slots: ["root", "item", "row", "toggle", "label", "icon", "children", "itemSlot"],
  base: {
    root: "flex flex-col gap-0.5 text-sm",
    item: "flex flex-col",
    row: "flex items-center gap-1 rounded-md pr-2 py-1 text-highlighted hover:bg-elevated data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[disabled=true]:opacity-50",
    toggle:
      "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-muted hover:text-highlighted disabled:cursor-default disabled:opacity-0",
    label: "flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 truncate text-left",
    icon: "shrink-0 text-muted data-[selected=true]:text-primary",
    children: "flex flex-col gap-0.5",
    itemSlot: "",
  },
  variants: {},
  defaultVariants: {},
});
