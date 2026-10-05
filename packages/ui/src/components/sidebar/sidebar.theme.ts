import { defineTheme } from "../../resolver";

export const RLSidebarTheme = defineTheme("sidebar", {
  slots: ["root", "header", "content", "footer", "item", "itemLink", "itemIcon", "itemBadge"],
  base: {
    root: "flex flex-col h-full w-64 bg-default border-r border-default shadow-sm transition-all duration-300",
    header:
      "flex h-16 items-center px-6 border-b border-default gap-2 font-semibold text-lg text-highlighted",
    content: "flex-1 overflow-y-auto p-4 flex flex-col gap-1.5",
    footer: "p-4 border-t border-default flex items-center justify-between",
    item: "relative",
    itemLink:
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-muted hover:text-highlighted transition-colors cursor-pointer",
    itemIcon: "size-4 text-current",
    itemBadge:
      "ml-auto flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold",
  },
  variants: {
    side: {
      left: { root: "left-0 border-r" },
      right: { root: "right-0 border-l" },
    },
    collapsible: {
      icon: {
        root: "w-16 [&_[data-slot=item-text]]:hidden [&_[data-slot=item-badge]]:hidden [&_[data-slot=sidebar-logo]]:hidden",
      },
      offcanvas: { root: "-translate-x-full" },
      none: {},
    },
    variant: {
      sidebar: {},
      floating: {
        root: "m-4 rounded-xl border border-default shadow-md h-[calc(100vh-2rem)] bg-default/95 backdrop-blur",
      },
      inset: {
        root: "bg-muted/40 border-none p-2",
      },
    },
  },
  defaultVariants: {
    side: "left",
    collapsible: "none",
    variant: "sidebar",
  },
});
