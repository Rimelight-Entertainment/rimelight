import { defineTheme } from "../../resolver";

export const RLTableOfContentsTheme = defineTheme("table-of-contents", {
  slots: [
    "root",
    "container",
    "title",
    "list",
    "item",
    "link",
    "linkText",
    "trigger",
    "triggerLabel",
    "triggerIcon",
    "trailingIcon",
    "body",
    "bodyList",
    "bodyItem",
    "bodyLink",
  ],
  base: {
    root: "sticky top-(--rl-header-height) z-10 bg-default/75 lg:bg-[initial] backdrop-blur -mx-4 px-4 sm:px-6 sm:-mx-6 lg:ms-0 xl:mx-0 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-var(--rl-header-height))]",
    container:
      "pt-4 sm:pt-6 pb-2.5 sm:pb-4.5 lg:py-8 border-b border-dashed border-default lg:border-0 flex flex-col",
    title: "truncate",
    list: "min-w-0 mt-2xl flex flex-col gap-xs",
    item: "min-w-0 ps-9 data-[depth=2]:ps-xs data-[depth=3]:ps-6",
    link: "group relative text-sm flex items-center focus-visible:outline-primary py-1 aria-[current=location]:text-primary aria-[current=location]:font-semibold",
    linkText: "truncate",
    trigger:
      "group flex items-center justify-between gap-3 px-4 h-10 text-sm font-medium text-highlighted cursor-pointer select-none hover:bg-muted/40 transition-colors list-none",
    triggerLabel: "flex items-center gap-2",
    triggerIcon: "size-4 text-primary shrink-0",
    trailingIcon:
      "size-4 text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180",
    body: "px-4 pt-3 max-h-[40vh] overflow-y-auto border-t border-default/50 bg-default",
    bodyList: "flex flex-col gap-0.5 pb-8",
    bodyItem: "data-[depth=3]:ps-4",
    bodyLink:
      "block py-1.5 text-sm text-muted transition-colors hover:text-primary no-underline data-[depth=2]:text-highlighted data-[depth=2]:font-medium",
  },
});
