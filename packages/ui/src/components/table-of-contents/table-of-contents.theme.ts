import { defineTheme } from "../../themes"

export const createTableOfContentsTheme = () =>
  defineTheme({
    slots: [
      "root",
      "container",
      "top",
      "bottom",
      "trigger",
      "title",
      "trailing",
      "trailingIcon",
      "content",
      "list",
      "listWithChildren",
      "item",
      "itemWithChildren",
      "link",
      "linkText",
      "indicator",
      "indicatorLine",
      "indicatorActive"
    ],
    base: {
      root: "sticky top-(--ui-header-height) z-10 bg-default/75 lg:bg-[initial] backdrop-blur -mx-4 px-4 sm:px-6 sm:-mx-6 lg:ms-0 xl:mx-0 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-var(--ui-header-height))]",
      container:
        "pt-4 sm:pt-6 pb-2.5 sm:pb-4.5 lg:py-8 border-b border-dashed border-default lg:border-0 flex flex-col",
      top: "",
      bottom: "hidden lg:flex lg:flex-col gap-6",
      trigger:
        "group text-sm font-semibold flex-1 flex items-center gap-1.5 py-1.5 -mt-1.5 focus-visible:outline-primary",
      title: "truncate",
      trailing: "ms-auto inline-flex gap-1.5 items-center",
      trailingIcon:
        "size-5 transform transition-transform duration-200 shrink-0 group-data-[state=open]:rotate-180 lg:hidden",
      content:
        "relative data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden focus:outline-none",
      list: "min-w-0",
      listWithChildren: "ms-3",
      item: "min-w-0",
      itemWithChildren: "",
      link: "group relative text-sm flex items-center focus-visible:outline-primary py-1",
      linkText: "truncate",
      indicator: "",
      indicatorLine: "",
      indicatorActive: ""
    },
    variants: {
      interactive: {
        true: {
          root: "hover:shadow-md hover:-translate-y-0.5 cursor-pointer hover:border-primary/30"
        },
        false: { root: "" }
      },
      overlay: {
        true: { root: "relative aspect-square", content: "absolute inset-0 z-10" },
        false: { root: "" }
      }
    },
    defaultVariants: {
      interactive: false,
      overlay: false
    }
  })

export default createTableOfContentsTheme()
