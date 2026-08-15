import { defineTheme } from "../../utils/resolver"

export const accordionTheme = defineTheme("accordion", {
  slots: [
    "root",
    "item",
    "header",
    "trigger",
    "content",
    "body",
    "leadingIcon",
    "trailingIcon",
    "label"
  ],
  base: {
    root: "w-full",
    item: "border-b border-default last:border-b-0",
    header: "flex",
    trigger:
      "group flex w-full flex-1 items-center gap-1.5 font-medium text-sm py-3.5 px-4 focus-visible:outline-primary min-w-0 cursor-pointer list-none [&::-webkit-details-marker]:hidden",
    content: "overflow-hidden focus:outline-none pt-1 px-4",
    body: "text-sm pb-3.5 text-astro-gray-200",
    leadingIcon: "shrink-0 size-5 text-astro-gray-300",
    trailingIcon:
      "shrink-0 size-5 ms-auto rotate-0 transition-transform duration-200 group-open:rotate-180 text-astro-gray-300",
    label: "text-start break-words text-astro-gray-100"
  },
  variants: {
    disabled: {
      true: {
        trigger: "cursor-not-allowed opacity-50 select-none"
      }
    }
  },
  defaultVariants: {}
})
