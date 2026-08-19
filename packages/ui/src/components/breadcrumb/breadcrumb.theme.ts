import { defineTheme } from "../../resolver"

export const breadcrumbTheme = defineTheme("breadcrumb", {
  slots: ["root", "list", "item", "link", "separator", "page"],
  base: {
    root: "aria-label='breadcrumb'",
    list: "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted sm:gap-2.5",
    item: "flex items-center gap-1.5",
    link: "transition-colors hover:text-highlighted cursor-pointer decoration-none text-current",
    separator: "flex size-3.5 items-center justify-center [&_svg]:size-3.5 opacity-60",
    page: "font-normal text-highlighted"
  }
})
